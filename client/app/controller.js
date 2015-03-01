var pocketciv = require("../../src/core/pocketciv");
var pocketcivApp = angular.module('pocketcivApp', ['ngStorage', 'snap', 'ui.bootstrap', 'ngSanitize']);
var runplay = require("../../src/core/runplay");
var eventplay = require("../../src/core/event");
var reducer = require("../../src/core/reducer");
var sprintf = require("sprintf");
var mustache = require("mustache");
var Map = require("./map")
var AdvanceAcquirer = require("../../src/actions/acquire").AdvanceAcquirer;

pp = pocketciv

function getMovement(areas) {
    return _.object(_.map(pocketciv.Map.areas, function (area, id) {
        return [id, area.tribes ? area.tribes : 0 ];
    }));
}

resetGameLog = function(scen){
gameLog = {
    "scenario": scen,
    "move": [],
    "deck": [],
    "reduce": [],
    "areas": [],
    "advance": [],
    "acquires": [],
};
};
resetGameLog();

var scenarios = {
    "1": require("../../src/scenarios/scenario1"),
    "2": require("../../src/scenarios/scenario2"),
    "3": require("../../src/scenarios/scenario3"),
    "8": require("../../src/scenarios/scenario8"),
}

pocketcivApp.controller('MainGame', function ($scope, $http, $localStorage) {
    $scope.snapOpts = {
    }
    $scope._ = _;
    $scope.$storage = $localStorage;
    if (!$localStorage.saves)
        $localStorage.saves = {};
    $scope.map = pocketciv.Map;
    $scope.deck = pocketciv.EventDeck;
    $scope.scenarios = scenarios;
    $scope.welcome = true;
    
    var moveFunc = undefined;
    $scope.moveTribes = function() {
        var mover = new pocketciv.TribeMover(
            pocketciv.Map.areas,
            pocketciv.Engine.params.moveLimit,
            pocketciv.Engine.params.sea_move ? pocketciv.Engine.params.sea_cost : undefined);
        mover.init(getMovement(pocketciv.Map.areas));
        var ok = mover.ok($scope.movement);
        if (ok.ok)
        {
            console.log("OK MOVE!");
            moveFunc(ok);
            $scope.hideMover = true;
            $scope.mapInfo = undefined;
            mapClicked = oldClicked;
            gameLog.move.push($scope.movement)
        } else {
            console.log("FAILED MOVE")
        }
    }
    $scope.hideMover = true;
    
    var moveFrom = 0;
    pocketciv.Engine.mover = function(situation, move) {
        console.log("Show mover")
        // Plain mover
        $scope.movement = getMovement(situation);
        $scope.hideMover = false;
        moveFunc = move;
        var mover = new pocketciv.TribeMover(
            pocketciv.Map.areas,
            pocketciv.Engine.params.moveLimit,
            pocketciv.Engine.params.sea_move ? pocketciv.Engine.params.sea_cost : undefined);
        
        // UI
        $scope.mapInfo = "Move tribes by clicking start region and then target region";
        $scope.mapTitle = "MOVE"
        oldClicked = mapClicked;
        mapClicked = function(region) {
            if (region < 1 || region > 8)
                return;
            if (moveFrom == 0)
            {
                if ($scope.movement[region] > 0)
                {
                    moveFrom = region;
                    selectRegion(region);
                }
            } else {
                mover.init(getMovement(pocketciv.Map.areas));
                $scope.movement[moveFrom]--;
                $scope.movement[region]++;
                var ok = mover.ok($scope.movement);
                $scope.mapTitle = "MOVE "+(ok.reduce || "");
                if (ok.ok)
                {
                    drawElem("tribes", region, $scope.movement[region]);
                    drawElem("tribes", moveFrom, $scope.movement[moveFrom]);
                    moveFrom = 0;
                    clearRegions();
                } else {
                    $scope.movement[moveFrom]++;
                    $scope.movement[region]--;
                }
            }
        }
        $scope.mapDone = function() {
            $scope.moveTribes();
        }
        
    }
    
    var drawnFunc = undefined;
    $scope.hideDrawer = true;
    $scope.drawCard = function(stop) {
        if (stop != true) {
            $scope.card = $scope.deck.draw();
            if ($scope.specificCard)
                $scope.card = pocketciv.EventDeck.specific($scope.specificCard);
            gameLog.deck.push($scope.card.id)
        } else {
            
        }
        $scope.specificCard = undefined;
        $scope.hideDrawer = true;
        if (stop != true)
            drawnFunc && drawnFunc.call(pocketciv.Engine, $scope.card);
        else
            drawnFunc && drawnFunc.call(pocketciv.Engine, false);
    }
    
   pocketciv.Engine.reducer = function(reducer, done) {
        console.log("Show reducer "+reducer.opts)
        $scope.reducer = reducer;
        $scope.reduceReady = done;
    }
    
    pocketciv.Engine.drawer = function(deck, drawn, canstop) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
        $scope.showStopper = (canstop == true);
        drawnFunc = drawn;
    }

    $scope.areaChangeOk = function() {
        $scope.areaChange = undefined;
        areaChangeDone.call($scope.engine);
        areaChangeDone = undefined;
        $(".highlight").removeClass('highlight');
    }
    
    var areaChangeDone = undefined;
    pocketciv.Engine.areaChanger = function(changes, done) {
        $scope.areaChange = changes;
        areaChangeDone = done;
        if (_.isEmpty(changes) || $scope.engine.phase == 'move')
            $scope.areaChangeOk();
        else {
            _.each(_.keys(changes), function(k) {
                $("[id$='"+k+"']:not([id$='-1'])").addClass('highlight');
            });
        }
    }
    
    // TODO: These region functions to map.js ?
    var clearRegions = function() {
        $(".activeCanvas").removeClass('active');
    }
    
    var selectRegion = function(region) {
        $(".activeCanvas:not(#activeCanvas"+region+")").removeClass('active');
        $("#activeCanvas"+region).addClass('active');
    }
    
    var addRegion = function(region) {
        $("#activeCanvas"+region).addClass('active');
    }
    
    // End region functions
    
    $scope.possibleAreas = []
    $scope.selectedArea = undefined;
    var areaSelect = undefined;
    $scope.selectArea = function() {
        $scope.possibleAreas = []
        mapClicked = oldClicked;
        $scope.mapInfo = undefined;
        $scope.actionStack.pop();
        if ($scope.selectedArea)
        {
            areaSelect(pocketciv.Engine.map.areas[$scope.selectedArea]);
            gameLog.areas.push($scope.selectedArea)
        }
        clearRegions();
        $scope.selectedArea = undefined;
    }

    var oldClicked = undefined;
    pocketciv.Engine.areaSelector = function(possibleAreas, select)
    {
        console.log('Area select');
        $scope.possibleAreas = _.keys(possibleAreas);
        $scope.mapInfo = "Select an area from areas "+$scope.possibleAreas;
        $scope.actionStack.push("#mapinfo");
        oldClicked = mapClicked;
        mapClicked = function(region) {
            if ($scope.possibleAreas.indexOf(region.toString()) > -1)
            {
                $scope.selectedArea = region.toString();
                selectRegion(region);
            }
        }
        $scope.mapDone = function() {
            $scope.selectArea();
        }

        console.log($scope.possibleAreas);
        areaSelect = select;
    }

    pocketciv.Engine.selector = pocketciv.Engine.areaSelector;
    
    pocketciv.Engine.queryUser = function(type, message)
    {
        return confirm(message);
    }
    
    $scope.getAcquireClasses = function(key) {
        var ret = [];
        if (($scope.engine.acquired && $scope.engine.acquired.indexOf(key) > -1) || ($scope.acquired && $scope.acquirer.acquired[key]))
            ret.push("acquired");
        if ($scope.possibleAdvances && _.has($scope.possibleAdvances, key))
        {
            if ($scope.possibleAdvances[key].areas.length)
                ret.push("areas");
            ret.push("available");
        }
        if ($scope.selAdv && $scope.selAdv.name == key)
            ret.push("selected");
        return ret;
    }
    var doAcquire = undefined;
    $scope.acquiring = false;

    pocketciv.Engine.advanceAcquirer = function(engine, done) {
        $scope.acquirer = new AdvanceAcquirer(engine);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
        $scope.acquiring = true;
        doAcquire = done;
        $scope.toggleTechTree();
    }
    
    $scope.acquireGo = function() {
        $scope.acquirer.acquire($scope.selAdv.name, $scope.selArea.id);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
        $scope.acquired = _.map($scope.acquirer.acquired, function(v) {
            return v.title;
        });
    }
    
    $scope.acquireOk = function() {
        doAcquire.call($scope.engine, $scope.acquirer.acquired);
        if ($scope.acquirer.acquired)
            gameLog.acquires.push(
                _.object(_.map($scope.acquirer.acquired, function (advn, key) {
                    return [key, advn.name];
                }))
            );
        else
            _.last(gameLog.advance).pop("acquire");
        $scope.acquiring = false;
        $scope.possibleAdvances = undefined;
    }
    
    $scope.selAdv = undefined;
    $scope.selEvent = undefined;
    $scope.toggleTechTree = function() {
        $scope.showTT = !$scope.showTT;
        if (!$scope.showTT && $scope.acquiring)
            $scope.acquireOk()
        $scope.acquirer = new AdvanceAcquirer($scope.engine);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
    }
    
    $scope.totalCity = function() { return _.reduce($scope.engine.map.areas, function(memo, a) { return a.city ? memo + a.city : memo; }, 0); };
    $scope.selectAdv = function(adv) {
        $scope.selAdv = adv;
        $scope.selArea = undefined;
        $scope.selEvent = undefined;
        if (!$scope.possibleAdvances[adv.name]) return;
        if ($scope.possibleAdvances[adv.name].areas.length == 1)
            $scope.selArea = $scope.engine.map.areas[$scope.possibleAdvances[adv.name].areas[0]];
    }
    
    $scope.advTitle = function(advances) {
            
        return _.map(advances, function (adv) {
            if (!_.isArray(adv))
                adv = [adv];
            return _.map(adv, function(ad) {
                var a = $scope.engine.advances[ad];
                return a ? a.title : ad;
            }).join(" or ");
        }).join(" and ");
    }
    
    $scope.selectEvent = function(ev) {
        $scope.selEvent = null;
        setTimeout(function() {
            $scope.selEvent = ev
            $scope.$apply();
        }, 10)
    }
    
    $scope.advArea = function(area) {
        if (
            $scope.selAdv && 
            $scope.possibleAdvances[$scope.selAdv.name].areas.indexOf(area.id.toString()) > -1)
            $scope.selArea = area;
    }
    
    $scope.doEvent = function(startEvent) {
        console.log("Startin godMode event "+startEvent);
        try {
            var ev = JSON.parse(startEvent)
        } catch(e) {
            var ev = { name: startEvent };
        }
        $scope.engine.doEvent(ev)
    }
    
    $scope.changePhase = undefined;
    $scope.goPhase = function() {
        $scope.engine.phase = $scope.changePhase;
        $scope.changePhase = undefined;
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          X: evt.clientX - rect.left,
          Y: evt.clientY - rect.top
        };
    }
    
    var mouseCanvas = document.getElementById("clickCanvas");
    var focusCnvs = $.makeArray($(".focusCanvas"));
    $scope.mapClick = function(ev) {
        var pnt = getMousePos(mouseCanvas, ev);
        var hex = map.getRegionAt(pnt.X, pnt.Y);
        mapClicked && mapClicked(hex);
    }
    
    var mapClicked = function(region) {
        console.log("Map clicked on region "+region);
    }
    
    $scope.mapFocus= function(ev) {
        if ('ontouchstart' in document.documentElement) return;
        var pnt = getMousePos(mouseCanvas, ev);
        var hex = map.getRegionAt(pnt.X, pnt.Y);
        for (var i = 1; i <= 8; i++)
        {
            if (i == hex)
                $(focusCnvs[i-1]).addClass('focus');
            else
                $(focusCnvs[i-1]).removeClass('focus');
        }
    }
    
    $scope.advance = function(name) {
        $scope.engine.runPhase('advance', name);
        _.last(gameLog.advance).push(name);
    }
    
    $scope.$watch(function(){ return pocketciv.Engine.phase; }, function(name) {
        if (loading || !name) return;
        if (name == 'advance')
        {
            console.log("gameLog advance")
            gameLog.advance.push([]);
        }
        $scope.mapInfo = undefined;
        $scope.hideDrawer = true;
        $scope.mapClicked = undefined;
        pocketciv.Engine.runPhase(name);
    })
    
    $scope.saveGamePlay = function() {
        console.log("Saving game "+$scope.gameName)
        $scope.$storage[$scope.gameName] = JSON.stringify(gameLog);
    }
    
    var loading = false;
    $scope.loadGamePlay = function(name, game) {
        $scope.gameName = name;
        console.log("run: "+game)
        gameLog = JSON.parse(game);
        loading = true;
        pocketciv.Engine.phase = "populate";
        runplay.run(pocketciv.Engine, JSON.parse(game), function() { loading = false; })
    }
    
    var drawElem = function(prop, reg, val) {
        var $elem = $('#' + prop + reg);

        if ($elem.length == 0 && val) {
            $elem = $('#' + prop).clone().attr('id', prop + reg).appendTo("#canvases")
            $elem.css({
                top: map.symbols[reg][prop].Y,
                left: map.symbols[reg][prop].X
            })
        }
        if ($elem.length > 0 && !val) $elem.remove()
        else $elem.html(val).show()
    }
    
    $scope.engine = pocketciv.Engine;
    $scope.engine.phase = "";
    $scope.godMode = true;
    
    $scope.toggleGod = function(gm) {
        $scope.godMode = gm;
    };
    
    /*
    pocketciv.Engine.signals.eventPhasing.add(function(phase, ev) {
        console.log("event phasing "+phase)
        if (phase == "0")
        {
            var event = pocketciv.Engine.events[ev.name];
            $scope.currentEvent = event;
            $scope.currentStep = phase;
        }
        else if (phase == "-1")
        {
        }
        else
        {
            $scope.currentStep = phase;
        }
    });
    */
    pocketciv.Engine.signals.phaser.add(function(status, phase) {
        console.log(phase+": "+status);
        if (status == "end") // && phase == "event")
        {
            $scope.currentEvent = undefined;
            $scope.currentStep = undefined;
            clearRegions();
        }
    });
    pocketciv.Engine.eventStepper = function(done, step, ctx) {
        if (ctx && ctx.event && ($scope.currentEvent == undefined || $scope.currentEvent.name != ctx.event.name))
        {
            $scope.currentEvent = ctx.engine.events[ctx.event.name];
            $scope.currentStep = { 'step': undefined, 'ctx': {} };
        }
        console.log("event phase stepper "+step);
        if ($scope.currentStep.step != step)
        {
            if (ctx.active_region)
                selectRegion(ctx.active_region.id)
                
            $scope.currentStep = { 'step': step, 'ctx': ctx };
            
            if (ctx.skip)
            {
                $scope.currentStep.skip = function() {
                    $scope.currentStep = undefined;
                    ctx.skip();
                }
                console.log("This event is skippable")
            }

            setTimeout(function() {
                $scope.$apply(function() {
                    done & done();
                });
            }, 500);
        }
        else
            done & done();
    };
    var map = new Object();
    
    var getCanvas = function(i) {
        return [$('#mapCanvas'+i)[0],
                $('#focusCanvas'+i).get(0),
                $('#activeCanvas'+i).get(0)];
    }
    var getImage = function(i) {
        //if (i != -1) //Uncomment to see the coordinates
            return $('#mapImage'+i)[0];
    }
    
    $scope.resetUI = function() {
        $scope.mapInfo = undefined;
        $scope.mapTitle = undefined;
        $scope.areaChange = undefined;
        $scope.hideDrawer = true;
        $scope.mainMenu = false;
        $scope.card = undefined;
    }
    
    $scope.mainMenu = true;
    $scope.load = function(scen) {
        console.log("Loading "+scen.title);
        $scope.resetUI();
        resetGameLog(scen);
        $scope.engine.init(scen);
        
        map = new Map(pocketciv.Map);
        $scope.mapArea = _.clone(map);
        $scope.mapArea.width = Math.ceil($scope.mapArea.width - 80);
        $scope.mapArea.height -= 40;
        $scope.$apply();
        map.getCanvas = getCanvas;
        map.getImage = getImage;
        
        $("#canvases .icon, #canvases .symbol").remove();
        $('#map .areaCode').hide();
        map.paint();
        for (var reg in map.symbols)
        {
            $('#area'+reg).css({top: map.symbols[reg]['area'].Y, left: map.symbols[reg]['area'].X }).show()
        }
            
        $scope.$watch('engine.map', function() {
            console.log("Hey! Map changed!")
            for (var reg in $scope.map.areas)
            {
                if (!(reg in map.symbols))
                    continue
                
                for (var prop in $scope.map.areas[reg])
                {
                    if (!(prop in map.symbols[reg]))
                        continue;
                        
                    var val = $scope.map.areas[reg][prop];
                    drawElem(prop, reg, val);
                }
            }
        }, true)
        
        $scope.$watch('engine.state', function(val) {
            $scope.$storage.current = val;
        }, true);
        
        $scope.$watch('engine.actions', function(val) {
            if (_.size(val) > 5)
            {
                $scope.manyActions = true;
            }
        }, true);
        
        $scope.welcome = false;
    }
    
    $scope.saveName = "";
    $scope.save = function(saveName) {
        $scope.$storage.saves[saveName] = $scope.engine.state
        $scope.saved = true;
        setTimeout(function() { $scope.saved = false; }, 3000);
    }
    
    $scope.$watch('engine.phase', function(val) {
        if (val == 'advance')
            $scope.actionStack.push("#advancePhase");
    });

    var actionStack = new Object();
    var aStack =[];
    actionStack.push = function(sel) {
        $(_.last(aStack)).addClass('away');
        aStack.push(sel);
        $(sel).removeClass('away');
    }
    actionStack.pop = function() {
        var sel = aStack.pop();
        $(sel).removeClass('away');
        $(_.last(aStack)).removeClass('away');
    }
    $scope.actionStack = actionStack;
    
    $scope.bugDescr = undefined;
    $scope.sendBug = function() {
        console.log("Sending bug")
        var gLog = _.clone(gameLog)
        gLog.comment = $scope.bugDescr;
        //gLog.engine = $scope.engine;
        $http.post('gamelog/add', gLog).success(function(data) {
            $scope.bugSent = true;
            setTimeout(function() { $scope.bugSent = false; }, 3000);
        })
    }
    
    $(document).ready(function() {
        $(".collapsible h2").click(function() {
            var $par = $(this).parent();
            if ($par.is('.away.temp'))
                $par.removeClass('away').removeClass('temp');
            else if ($par.is('.away')) {}
            else
                $par.addClass('away').addClass('temp');
        } )
        
        
        $(".menu-arrow").height($("#welcome p:nth(1)").position().top)    
        $(window).resize(function() {
            $(".menu-arrow").height($("#welcome p:nth(1)").position().top)    
        })
    })
});

pocketcivApp.directive('pcEventView', function() {
    return {
        restrict: 'E',
        scope:
        {
            event: "=event",
            engine: "=engine",
            currentStep: "=step",
        },
        templateUrl: 'app/event/event.html',
        link: function($scope, tElem) {
            $scope.$watch('event', function (event) {
                var ext = eventplay.extendSteps(event, $scope.engine.advances, _.keys($scope.engine.advances), { 'engine': $scope.engine });
                $scope.steps_order = ext[1];
                $scope.steps = ext[0];
            });
        },
      }
})

pocketcivApp.directive('pcEventStep', function($rootScope) {
    return {
        restrict: 'E',
        transclude: true,
        scope:
        {
            step: "=step",
            event: "=event",
            engine: "=engine",
            currentStep: "=cstep",
        },
        link: function($scope, tElem, tAttr) {
            var event = $scope.event;
            var finalElement = tElem;
            var render = function(step) {
                var context = (step && step.ctx) || {};
                if (!$scope.step)  return;
                var d = $scope.step.replace(/{%.*?%}/g, "");
                d = d.replace(/{{ ([a-z_]+) }}/g, "{{{ $1 }}}")
                
                var adv_regex = /{{ adv:(.*?) }}/g;
                var m;
                var stepcl = "";
                var cloned = d;

                while(m = adv_regex.exec(cloned))
                {
                    var adv = $scope.engine.advances[m[1]];
                    var acq = $scope.engine.acquired.indexOf(m[1]) > -1;
                    if (stepcl != "available")
                        stepcl = acq ? "available " : "not_available ";
                    d = d.replace(m[0], adv.title);
                }
                
                var ctx = _.clone(context);
                if (context.active_region)
                    ctx.active_region = "<span class='areaCode'>"+context.active_region.id+"</span>"
                var rctx = _.extend(window, ctx);
                rctx = _.extend(rctx, $scope.engine.advances);
                if (d.indexOf("+") == 0)
                {
                    stepcl = stepcl + "positive";
                    d = d.trim("+ ");
                }
                if (d.indexOf("-") == 0)
                {
                    stepcl = stepcl + "negative";
                    d = d.trim("- ");
                }
                d = "<span class='stepdescr "+stepcl+"'>"+d+"</span>";
                var final = mustache.render(d, rctx);
                fElem = $(final)[0];
                $(finalElement).replaceWith(fElem);
                finalElement = fElem;
            };
            render();
            $scope.$watch("currentStep", render);
        },
      }
})

pocketcivApp.filter('eventFormat', function() {
    return function(descr, context) {
        var d = descr.replace(/{%.*?%}/g, "");
        d = d.replace(/{{ ([a-z_]+) }}/g, "{{{ $1 }}}")
        
        var adv_regex = /{{ adv:(.*?) }}/g;
        var stepcl = "";
        var m;
        while (m = adv_regex.exec(d))
        {
            var adv = engine.advances[m[1]];
            var acq = engine.acquired.indexOf(m[1]) > -1;
            if (stepcl != "available")
                stepcl = stepcl + (acq ? "available " : "not_available ");
            d = d.replace(m[0], adv.title);
        }
        var ctx = _.clone(context);
        if (context.active_region)
            ctx.active_region = "<span class='areaCode'>"+context.active_region.id+"</span>"
        var rctx = _.extend(window, ctx);
        rctx = _.extend(rctx, engine.advances);
        if (d.indexOf("+") == 0)
        {
            stepcl = stepcl + "positive";
            d = d.trim("+ ");
        }
        d = "<span class='"+stepcl+"'>"+d+"</span>";
        return mustache.render(d, rctx);
    };
});

pocketcivApp.filter('sprintf', function() {
    return function(str, params) {
        return sprintf(str, params);
    };
});
/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
pocketcivApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});

pocketcivApp.directive('jsonText', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: 'ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModelCtrl) {

      var lastValid;

      // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
      ngModelCtrl.$parsers.push(fromUser);
      ngModelCtrl.$formatters.push(toUser);

      // clear any invalid changes on blur
      element.bind('blur', function () {
        element.val(toUser(scope.$eval(attrs.ngModel)));
      });

      // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
      // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
      scope.$watch(attrs.ngModel, function(newValue, oldValue) {
        lastValid = lastValid || newValue;

        if (newValue != oldValue) {
          ngModelCtrl.$setViewValue(toUser(newValue));

          // TODO avoid this causing the focus of the input to be lost..
          ngModelCtrl.$render();
        }
      }, true); // MUST use objectEquality (true) here, for some reason..

      function fromUser(text) {
        // Beware: trim() is not available in old browsers
        if (!text || text.trim() === '') {
          return {};
        } else {
          try {
            lastValid = angular.fromJson(text);
            ngModelCtrl.$setValidity('invalidJson', true);
          } catch(e) {
            ngModelCtrl.$setValidity('invalidJson', false);
          }
          return lastValid
        }
      }

      function toUser(object) {
        // better than JSON.stringify(), because it formats + filters $$hashKey etc.
        return angular.toJson(object, true);
      }
    }
  };
});
