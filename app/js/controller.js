var pocketciv = require("../../core/pocketciv");
var pocketcivApp = angular.module('pocketcivApp', ['ngStorage', 'snap', 'ui.bootstrap']);
var runplay = require("../../core/runplay")

pp = pocketciv

function getMovement(areas) {
    return _.object(_.map(pocketciv.Map.areas, function (area, id) {
        return [id, area.tribes ? area.tribes : 0 ];
    }));
}

resetGameLog = function(){
gameLog = {
    "move": [],
    "deck": [],
    "reduce": [],
    "areas": [],
    "advance": []
};
};
resetGameLog();

var scenarios = {
    "1": require("../scenarios/scenario1"),
    "2": require("../scenarios/scenario2"),
}

pocketcivApp.controller('MainGame', function ($scope, $http, $localStorage) {
    $scope.snapOpts = {
    }
    $scope._ = _;
    $scope.$storage = $localStorage;
    $scope.map = pocketciv.Map;
    $scope.deck = pocketciv.EventDeck;
    $scope.scenarios = scenarios;
    
    var moveFunc = undefined;
    $scope.moveTribes = function() {
        var mover = new pocketciv.TribeMover(pocketciv.Map.areas);
        mover.init(getMovement(pocketciv.Map.areas));
        if (mover.ok($scope.movement))
        {
            console.log("OK MOVE!");
            moveFunc.call(pocketciv.Engine, $scope.movement);
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
        var mover = new pocketciv.TribeMover(pocketciv.Map.areas);
        
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
                if (mover.ok($scope.movement))
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
    $scope.drawCard = function() {
        $scope.card = $scope.deck.draw();
        if ($scope.specificCard)
            $scope.card = pocketciv.EventDeck.specific($scope.specificCard);
        $scope.specificCard = undefined;
        $scope.hideDrawer = true;
        gameLog.deck.push($scope.card.id)
        drawnFunc && drawnFunc.call(pocketciv.Engine, $scope.card);
    }
    
    var reduceFunc = undefined;
    $scope.hideReducer = true;
    pocketciv.Engine.reducer = function(reducer, done) {
        console.log("Show reducer")
        $scope.hideReducer = false;
        $scope.reducer = reducer;
        if (reducer.mode == 'Overall')
        {
            var areas = $scope.reducer.areas();
            var rdcObj = {};
            _.each(areas, function(area) {
                rdcObj[area.id] = {
                    'tribes': area.tribes,
                    'city': area.city }
            }, this);
            $scope.reduceObject= rdcObj;
            $scope.mapDone = function() {
                $scope.reduceReady();
            }
        }
        else {
            oldClicked = mapClicked;
            $scope.reduceArray = [];
            if (reducer.startRegion)
                selectRegion(reducer.startRegion.id);
            mapClicked = function(region) {
                if (_.keys($scope.reduceAreas).indexOf(region.toString()) > -1) {
                    $scope.reduceArray.push(region.toString())
                    addRegion(region);
                    checkReducer();
                }
            }
            $scope.mapDone = function() {
                $scope.reduceReady();
            }
        }
        reduceFunc = done;
        checkReducer();
    }
    var reduceSubstr = function(areas, rdcObj) {
        var ret = {};
        _.each(rdcObj, function(val, key) {
            ret[key] = {
                'tribes': val.tribes - (areas[key].tribes || 0),
                'city': val.city - (areas[key].city || 0)
            }
        });
        return ret;
    }
    var checkReducer = function() {
        console.log('reduce array change')
        console.log($scope.reduceArray)
        if ($scope.hideReducer)
            return;
        if ($scope.reducer.mode == 'AreaWalker')
        {
            var ok = $scope.reducer.ok($scope.reduceArray);
            $scope.reduceAreas = ok.areas;
            $scope.mapInfo = "Select an area from areas "+_.keys($scope.reduceAreas)+". \
            Still left "+ok.amount;
        } else {
            var subtr = reduceSubstr($scope.engine.map.areas, $scope.reduceObject);
            var ok = $scope.reducer.ok(subtr);
            console.log("Substracted")
            console.log(subtr)
            $scope.mapInfo = "Reduce from areas "+_.keys(ok.areas)+". \
            Still left "+ok.amount;
        }
    };
    $scope.reduceReady = function() {
        var rdc = undefined;
        if ($scope.reducer.mode == 'AreaWalker')
            rdc = $scope.reduceArray;
        else
            rdc = reduceSubstr($scope.engine.map.areas, $scope.reduceObject);
        var ok = $scope.reducer.ok(rdc);
        if (ok.ok != false)
        {
            gameLog.reduce.push(rdc)
            clearRegions();
            $scope.hideReducer = true;
            mapClicked = oldClicked;
            $scope.mapInfo = undefined;
            $scope.reduceArray = undefined;
            $scope.reduceObject = undefined;
            reduceFunc(ok.changes);
        }
    }
    $scope.$watchCollection('reduceArray', checkReducer);
    $scope.$watch('reduceObject', checkReducer, true);
    
    pocketciv.Engine.drawer = function(deck, drawn) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
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
        if (_.isEmpty(changes))
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
    
    var doAcquire = undefined;
    $scope.acquiring = false;
    pocketciv.Engine.advanceAcquirer = function(engine, done) {
        $scope.acquirer = new pocketciv.AdvanceAcquirer(engine);
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
        doAcquire.call($scope.engine, $scope.acquirer.acquired)
        $scope.acquiring = false;
        $scope.possibleAdvances = undefined;
    }
    
    $scope.selAdv = undefined;
    $scope.toggleTechTree = function() {
        $scope.showTT = !$scope.showTT;
        if (!$scope.showTT && $scope.acquiring)
            $scope.acquireOk()
        $scope.acquirer = new pocketciv.AdvanceAcquirer($scope.engine);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
    }
    
    $scope.selectAdv = function(adv) {
        $scope.selAdv = adv;
        $scope.selArea = undefined;
        if ($scope.possibleAdvances[adv.name].areas.length == 1)
            $scope.selArea = $scope.engine.map.areas[$scope.possibleAdvances[adv.name].areas[0]];
    }
    
    $scope.advArea = function(area) {
        if (
            $scope.selAdv && 
            $scope.possibleAdvances[$scope.selAdv.name].areas.indexOf(area.id.toString()) > -1)
            $scope.selArea = area;
    }
    
    $scope.doEvent = function() {
        try {
        var ev = JSON.parse($scope.startEvent)
        } catch(e) {
            var ev = { name: $scope.startEvent };
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
        mapClicked(hex);
    }
    
    var mapClicked = function(region) {
        console.log("Map clicked on region "+region);
        $("#activeCanvas"+region).toggleClass('active');
    }
    
    $scope.mapFocus= function(ev) {
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
    $scope.godMode = false;
    
    var map = new Object();
    
    var getCanvas = function(i) {
        return [$('#mapCanvas'+i)[0],
                $('#focusCanvas'+i).get(0),
                $('#activeCanvas'+i).get(0)];
    }
    var getImage = function(i) {
        return $('#mapImage'+i)[0];
    }
    
    $scope.resetUI = function() {
        $scope.mapInfo = undefined;
        $scope.mapTitle = undefined;
        $scope.areaChange = undefined;
        $scope.hideDrawer = true;
        $scope.mainMenu = false;
        $scope.card = undefined;
        resetGameLog();
        
    }
    
    $scope.mainMenu = true;
    $scope.load = function(scen) {
        console.log("Loading "+scen.title);
        $scope.resetUI();
        $scope.engine.init(scen);
        
        map = new Map(pocketciv.Map);
        $scope.mapArea = map;
        $scope.$apply();
        map.getCanvas = getCanvas;
        map.getImage = getImage;
        
        $("#canvases .icon, #canvases .symbol").remove();
        $('.areaCode').hide();
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
        console.log($scope)
        $http.post('gamelog/add', gLog).success(function(data) {
            $scope.bugSent = true;
            setTimeout(function() { $scope.bugSent = false; }, 3000);
        })
    }
    
    $(document).ready(function() {
        $(".collapsible h2").click(function() {
            console.log("HEIEHIE")
            var $par = $(this).parent();
            if ($par.is('.away.temp'))
                $par.removeClass('away').removeClass('temp');
            else if ($par.is('.away')) {}
            else
                $par.addClass('away').addClass('temp');
        } )
    })
    
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
