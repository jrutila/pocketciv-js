var pocketciv = require("../../src/core/pocketciv");
var pocketcivApp = angular.module('pocketcivApp', [
        'ngStorage',
        'snap',
        'ui.bootstrap',
        'checklist-model',
        'ngSanitize',
        'angulartics', 'angulartics.google.analytics',
        'monospaced.qrcode',
        'cfp.hotkeys',
        'ui.checkbox'
        ]);
var runplay = require("../../src/core/runplay");
var eventplay = require("../../src/core/event");
var reducer = require("../../src/core/reducer");
var Context = require("../../src/core/context");
var sprintf = require("sprintf");
var mustache = require("mustache");
var handlebars = require("handlebars");
var Map = require("./map")
var AdvanceAcquirer = require("../../src/actions/acquire").AdvanceAcquirer;
var WonderBuilderer = require("../../src/actions/build").WonderBuilderer;
var signals = require("signals");

engine = undefined;


var scenarios = {
    "scenario1": require("../../src/scenarios/scenario1"),
    "scenario2": require("../../src/scenarios/scenario2"),
    "scenario3": require("../../src/scenarios/scenario3"),
    "scenario4": require("../../src/scenarios/scenario4"),
    "scenario5": require("../../src/scenarios/scenario5"),
    "scenario6": require("../../src/scenarios/scenario6"),
    "scenario7": require("../../src/scenarios/scenario7"),
    "scenario8": require("../../src/scenarios/scenario8"),
    "scenario9": require("../../src/scenarios/scenario9"),
    "scenario10": require("../../src/scenarios/scenario10"),
    "scenario11": require("../../src/scenarios/scenario11"),
    "scenario12": require("../../src/scenarios/scenario12"),
    "scenario15": require("../../src/scenarios/scenario15"),
}

var tutorials = {
    "scenario1": require("./tutorials/tutorial1"),
}

pocketcivApp.controller('MainGame', function ($scope, $http, $localStorage, $analytics, $location) {
    var gameId = $location.$$absUrl.split('?');
    if (gameId.length > 1)
        gameId = gameId[1];
    else
        gameId = null;
    $scope.url = $location.$$protocol+"://"+$location.$$host;
    console.log(gameId)
    var getMovement = function(areas) {
        return _.object(_.map($scope.map.areas, function (area, id) {
            return [id, area.tribes ? area.tribes : 0 ];
        }));
    }
    
    $scope.debug = {};
    $scope.hideHelp = true;
    
    var resetGameLog = function(scen){
    $localStorage.gameLog = {
        "scenario": scen,
        "move": [],
        "deck": [],
        "reduce": [],
        "advance": [],
        "acquires": [],
        "builds": [],
        "log": [],
    };
    };
    resetGameLog();

    $scope.snapOpts = {
        maxPosition: 300
    }
    $scope._ = _;
    $scope.$storage = $localStorage;
    if (!$localStorage.saves)
        $localStorage.saves = {};
    $scope.scenarios = scenarios;
    $scope.tutorials = tutorials;
    $scope.tutorial = false;
    $scope.welcome = true;
    $scope.engine = {};
    var pocketimpl = {};
    
    $scope.startTutorial = function() {
        $scope.tutorial = tutorials[$scope.engine.name];
        $scope.tour = new Tour({
            steps: $scope.tutorial.steps,
            container: "#main",
            //backdrop: true
        });
        $scope.tour.end();
        $scope.tour.init();
        $scope.tour.signals = {
            'map': new signals.Signal()
        }
        $scope.tour.restart(true);
    }
    
    var moveFunc = undefined;
    $scope.moveTribes = function() {
        var mover = new pocketciv.TribeMover(
            $scope.engine.map.areas,
            $scope.engine.params.moveLimit,
            $scope.engine.params.sea_move ? $scope.engine.params.sea_cost : undefined);
            
        mover.init(getMovement($scope.engine.map.areas));
        var ok = mover.ok($scope.movement);
        if (ok.ok)
        {
            console.log("OK MOVE!");
            moveFunc(ok);
            $localStorage.gameLog.move.push($scope.movement)
            $scope.hideMover = true;
            $scope.mapInfo = undefined;
            $scope.movement = undefined;
            $scope.mover = undefined;
        } else {
            console.log("FAILED MOVE")
        }
    }
    $scope.hideMover = true;
    
    function handleOk(ok) {
        $scope.mapTitle = "MOVE "+(ok.cost || "");
        if (ok.ok)
        {
            _.each(ok.target, function(tr, ak) {
                drawElem("tribes", ak, tr);
            });
            
            _.each(ok.target, function(t, reg) {
                drawElem("seacost", reg, false);
            });
            if (ok.cost)
            {
                _.each(ok.cost[0], function(c, reg) {
                    drawElem("seacost", reg, -1*c);
                })
            }
            $scope.movement = ok.target;
            moveFrom = 0;
            clearRegions();
        }
    }
    
    $scope.$on("mapClick", function(event, region) {
        if (region < 1 || region > 8 || !$scope.movement)
            return;
        // Something does this sometimes, this fixes
        delete $scope.movement["NaN"];
        
        if (moveFrom == 0)
        {
            if ($scope.movement[region] > 0)
            {
                moveFrom = region;
                selectRegion(region);
            }
        } else {
            if (window.Worker) {
                $scope.mover.postMessage({ action: "init",
                 start: getMovement($scope.map.areas)
                });
            } else {
                $scope.mover.init(getMovement($scope.map.areas));
            }
            
            var movement = _.clone($scope.movement);
            movement[moveFrom]--;
            movement[region]++;
            
            if (window.Worker) {
                $scope.mover.postMessage({ action: "ok",
                    situation: movement
                });
            } else {
                var ok = $scope.mover.ok(movement);
                handleOk(ok, moveFrom, region);
            }
        }
    });
    
    var moveFrom = 0;
    pocketimpl.mover = function(situation, move) {
        console.log("Show mover")
        if ($scope.tutorial)
            $scope.forceMove = $scope.tutorial.game.move.shift();
        // Plain mover
        $scope.movement = getMovement(situation);
        $scope.hideMover = false;
        moveFunc = move;
        if (window.Worker) {
            $scope.mover = new Worker("moveworker.js");
            $scope.mover.postMessage({ action: "create",
                map: $scope.engine.map.areas,
                moveLimit: $scope.engine.params.moveLimit,
                seaCost: $scope.engine.params.sea_move ? $scope.engine.params.sea_cost : undefined
            });
            $scope.mover.onmessage = function(msg) {
                handleOk(msg.data);
            };
        } else
            $scope.mover = new pocketciv.TribeMover(
                $scope.engine.map.areas,
                $scope.engine.params.moveLimit,
                $scope.engine.params.sea_move ? $scope.engine.params.sea_cost : undefined);
        
        // UI
        $scope.mapInfo = "Move tribes by clicking start region and then target region";
        $scope.mapTitle = "Move"
        $scope.mapDone = function() {
            $scope.moveTribes();
        }
        
    }
    
    var drawnFunc = undefined;
    $scope.hideDrawer = true;
    $scope.drawCard = function(stop) {
        if (stop != true) {
            $scope.card = $scope.deck.draw();
            
            if ($scope.tutorial && !$scope.specificCard)
                $scope.specificCard = $scope.tutorial.game.deck.shift();
            
            if ($scope.specificCard)
                $scope.card = $scope.deck.specific($scope.specificCard);
            $localStorage.gameLog.deck.push($scope.card.id)
        } else {
            
        }
        $scope.specificCard = undefined;
        $scope.hideDrawer = true;
        if (stop != true)
            drawnFunc && drawnFunc.call($scope.engine, $scope.card);
        else
            drawnFunc && drawnFunc.call($scope.engine, false);
    }
    
   pocketimpl.reducer = function(reducer, done) {
        console.log("Show reducer "+reducer.opts)
        $scope.reducer = reducer;
        if ($scope.tutorial)
            $scope.reducer.forceReduce = $scope.tutorial.game.reduce.shift();
        $scope.reduceReady = function(ok) {
            if (ok)
            {
                if ($scope.engine.phase == "advance" && _.isEmpty(ok.chg))
                    _.last($localStorage.gameLog.advance).pop();
                else {
                    $localStorage.gameLog.reduce.push(_.rest(ok.chg, reducer.opts.initial.length));
                    if ($scope.engine.phase == "advance") {
                        // Something was done!
                        var action = _.last(_.last($localStorage.gameLog.advance));
                        action = $scope.engine.actions[action];
                        gameLogText(action, ok);
                    }
                }
                    
            } else 
                $localStorage.gameLog.reduce.push({});
            done(ok);
        };
    }
    
    handlebars.registerHelper("regions", function(context, options) {
        if (_.isObject(context))
            return _.keys(context).toString();
        else
            return context;
    });
    handlebars.registerHelper("render_acquires", function(context, options) {
        return _.map(context, function(acq) { return acq.name }).toString();
    });
    
    // TODO: Put this somewhere else please. Should it be in core pocketciv?
    function gameLogText(happening, ctx) {
        /*
        var change = { chg: ok };
        change.regions = "";
        _.each(ok.changes, function(v, k) {
            change.regions += k+",";
        });
        change.regions = change.regions.slice(0,-1);
        var ctx = {
            engine: $scope.engine,
            change: change,
        }
        */
        var log = happening.log;
        if (happening.log instanceof Function)
            log = happening.log(ctx)
        if (log) {
            var text = handlebars.compile(log)(ctx);
            $localStorage.gameLog.log.push(text);
        }
    }
    
    pocketimpl.drawer = function(deck, drawn, canstop) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
        $scope.showStopper = (canstop == true);
        drawnFunc = drawn;
        if (!canstop
            && (!$scope.engine.currentContext.eventCtx || $scope.engine.currentContext.eventCtx.skip == undefined)
            && $localStorage.options.fastgame
            && !$localStorage.options.drawcards )
            // Auto draw!
            $scope.drawCard();
    }

    $scope.areaChangeOk = function(skip) {
        // Pressed space
        if (skip instanceof KeyboardEvent)
            skip = null;
        $scope.areaChange = undefined;
        
        // Reset the event runner here
        $scope.currentEvent = undefined;
        $scope.currentStep = undefined;
        clearRegions();
        
        !skip && areaChangeDone.call($scope.engine);
        areaChangeDone = undefined;
        $(".highlight").removeClass('highlight');
    }
    
var changeString = function(chg) {
    var ret = undefined;
    if (_.isObject(chg)) {
        ret = {};
        _.each(chg, function(v,k) {
            ret[k] = changeString(v);
        });
    } else if (_.isNumber(chg)) {
        return chg > 0 ? "+"+chg.toString() : chg.toString();
    } else {
        return chg;
    }
    return ret;
};
    
    var areaChangeDone = undefined;
    pocketimpl.areaChanger = function(ctx, done) {
        var changes = changeString(ctx.changes);
        $scope.areaChange = changes;
        areaChangeDone = done;
        if (_.isEmpty(changes) || $scope.engine.phase == 'move')
            $scope.areaChangeOk();
        else {
            if ($scope.tutorial) {
                if ($scope.tour.afterEvent) {
                    $scope.tour.goTo($scope.tour.afterEvent);
                    $scope.tour.afterEvent = undefined;
                }
            } else {
                if ($localStorage.options.fastgame
                    && (!$scope.engine.currentContext.eventCtx || $scope.engine.currentContext.eventCtx.skip == undefined)
                    ) {
                    $scope.areaChangeOk();
                    return;
                }
            }
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
    pocketimpl.queryUser = function(type, message)
    {
        return confirm(message);
    }
    
    var resetAcquire = function() { return {
        selected: {},
        done: undefined,
        acquiring: false,
        acquirer: undefined,
    }; };
    var resetBuild = function() { return {
        selected: {},
        done: undefined,
        building: false,
        builder: undefined,
    }; };
    $scope.acquire = resetAcquire();
    $scope.build = resetBuild();
    $scope.showTT = false;
    
    $scope.$watch("engine.map.areas", function(areas) {
        $scope.acquire.acquirer = new AdvanceAcquirer($scope.engine);
    });
    $scope.$watch("engine.gold", function() {
        $scope.acquire.acquirer = new AdvanceAcquirer($scope.engine);
    });
    $scope.$watch("movement", function(movement) {
        var areas = {};
        _.each(movement, function(m, area) {
            areas[area] = _.clone($scope.engine.map.areas[area]);
            areas[area].tribes = m;
        });
        $scope.acquire.acquirer = new AdvanceAcquirer($scope.engine, areas);
    }, true);

    pocketimpl.advanceAcquirer = function(engine, done) {
        $scope.acquire.acquiring = true;
        $scope.acquire.done = done;
        $scope.toggleTechTree();
    }
    pocketimpl.wonderBuilder = function(engine, done) {
        $scope.build.builder = new WonderBuilderer(engine);
        $scope.build.building = true;
        $scope.build.done = done;
        $scope.toggleTechTree();
    }
    
    $scope.toggleTechTree = function() {
        $scope.showTT = !$scope.showTT;
        if ($scope.acquire.acquiring || $scope.build.building) {
            if (!$scope.showTT) {
                console.log("ACQUIRE/BUILD")
                if ($scope.acquire.acquiring) {
                    var d = $scope.acquire.done;
                    var now = $scope.acquire.acquirer.nowacquired;
                    var log = $localStorage.gameLog.acquires;
                } else {
                    var d = $scope.build.done;
                    var now = $scope.build.builder.nowbuilt;
                    var log = $localStorage.gameLog.builds;
                }
                d.call($scope.engine, now);
                
                if (now) {
                    log.push(now);
                    gameLogText($scope.engine.actions['acquire'],  $scope.engine.currentContext);
                }
                else
                    _.last($localStorage.gameLog.advance).pop();
                    
                $scope.acquire.acquiring = false;
                $scope.build.building = false;
                $scope.acquire.done = undefined;
                $scope.build.done = undefined;
                $scope.acquire.acquirer = new AdvanceAcquirer($scope.engine);
                $scope.build.builder = new WonderBuilderer($scope.engine);
            }
        } else {
            $scope.acquire.acquirer = new AdvanceAcquirer($scope.engine);
            $scope.build.builder = new WonderBuilderer($scope.engine);
        }
    }
    
    $scope.selEvent = undefined;
    
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
        var hex = $scope.mapHex.getHexAt(pnt.X, pnt.Y);
        var region = $scope.mapHex.getRegionAt(pnt.X, pnt.Y);
        $scope.$broadcast("hexClick", hex);
        mapClicked && mapClicked(region);
        $scope.tour && $scope.tour.signals.map.dispatch("click", region);
    }
    
    var mapClicked = function(region) {
        $scope.$broadcast("mapClick", parseInt(region));
    }
    
    $scope.mapFocus= function(ev) {
        if ('ontouchstart' in document.documentElement) return;
        var pnt = getMousePos(mouseCanvas, ev);
        var hex = $scope.mapHex.getRegionAt(pnt.X, pnt.Y);
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
        _.last($localStorage.gameLog.advance).push(name);
    }
    
    $scope.$watch(function(){ return $scope.engine.phase; }, function(name) {
        if (loading || !name) return;
        if (name == 'advance')
        {
            console.log("gameLog advance")
            $localStorage.gameLog.advance.push([]);
        }
        $scope.currentEvent = undefined;
        $scope.mapInfo = undefined;
        $scope.hideDrawer = true;
        $scope.mapClicked = undefined;
        clearRegions();
        if ($scope.tutorial && $scope.tour.pauseOn == name)
        {
            $scope.tour.engineContinue = function() {
              $scope.engine.runPhase(name);  
            }
        }
        else $scope.engine.runPhase(name);
    })
    
    $scope.saveGamePlay = function() {
        console.log("Saving game "+$scope.gameName)
        $scope.$storage[$scope.gameName] = JSON.stringify($localStorage.gameLog);
    }
    
    var loading = false;
    $scope.loadGamePlay = function(name, game) {
        $scope.gameName = name;
        console.log("run: "+game)
        $localStorage.gameLog = JSON.parse(game);
        loading = true;
        $scope.engine.phase = "populate";
        runplay.run($scope.engine, JSON.parse(game), function() { loading = false; })
    }
    
    var drawElem = function(prop, reg, val) {
        var map = $scope.mapHex;
        if (!_.has(map.symbols[reg], prop)) return;
        var $elem = $('#' + prop + reg);

        if ($elem.length == 0 && val) {
            $elem = $('#' + prop).clone().attr('id', prop + reg).appendTo("#canvases")
            $elem.css({
                top: map.symbols[reg][prop].Y,
                left: map.symbols[reg][prop].X
            })
        }
        $elem.show();
        if ($scope.godMode && $('#'+prop+'-edit').length) { // There needs to be edit for the prop
            // Show the editors instead
            var $edit = $("#"+prop+"-edit"+reg);
            if ($edit.length == 0) {
                $edit = $('#' + prop+"-edit").clone().attr('id', prop+"-edit" + reg).appendTo("#canvases")
                $edit.css({
                    top: map.symbols[reg][prop].Y,
                    left: map.symbols[reg][prop].X
                })
                // TODO: To angular?
                $edit.change(function(e) {
                    $scope.map.areas[reg][prop] = parseInt(e.target.value);
                });
            }
            $edit.attr("data-val", val);
            $edit.show();
            $edit.val(val);
            $elem.hide();
        }
        if ($elem.length > 0 && !val)
            $elem.remove()
        else {
            $elem.html(val);
            $elem.attr("data-val", val);
            $elem.css({
                top: map.symbols[reg][prop].Y,
                left: map.symbols[reg][prop].X
            })
        }
    }
    
    $scope.engine = new pocketciv.EngineBuild({});
    // signals is static
    $scope.engine.signals.phaser.add(function(event, value) {
        if (event == 'gameover') {
            console.log("Game Over: " + $scope.engine.name+ " " +value);
            $analytics.eventTrack('end', { category: 'game', label: $scope.engine.name, resolution: value});
        }
        if (event == 'end') {
            var phase = $scope.engine.phaseImpl[value];
            phase && gameLogText(phase, $scope.engine.currentContext);
        }
    });
    $scope.engine.phase = "";
    $scope.godMode = false;
    $localStorage.options = $localStorage.options || {
        fastgame: false,
        drawcards: false,
    };
    $scope.mapEditor = false;
    //@exclude
    $scope.godMode = true;
    //@endexclude
    
    $scope.toggleGod = function(gm) {
        $scope.godMode = gm;
        _.each($scope.map.areas, function(area, key) {
            if (area.tribes === undefined)
                area.tribes = 0;
            if (area.city === undefined)
                area.city = 0;
        });
        $scope.map.changed = $scope.map.changed ? $scope.map.changed+1 : 1;
        if (gm == false)
            $scope.mapEditor = false;
    };
    $scope.toggleMapEditor = function(me) {
        $scope.mapEditor = me;
    };
    
    pocketimpl.eventStepper = function(done, step, ctx) {
        if (step == "end")
        {
            console.log("Event ended")
            // Leave the current event to show
            //$scope.currentEvent = undefined;
            //$scope.currentStep = undefined;
            //clearRegions();
            // These will be called when the changes are accepted
            done();
            return;
        }
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
                    $scope.areaChange = undefined;
                    $scope.currentEvent = undefined;
                    $scope.reducer = undefined;
                    $(".highlight").removeClass('highlight');
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
    
    var getCanvas = function(i) {
        return [$('#mapCanvas'+i)[0],
                $('#focusCanvas'+i).get(0),
                $('#activeCanvas'+i).get(0)];
    }
    var getImage = function(i) {
        //if (i != -1) //Uncomment to see the coordinates
            return $('#mapImage'+i)[0];
    }
    
    $scope.hideEvent = function() {
        $("#eventRunner").toggleClass("pushed");
    }

    $scope.resetUI = function() {
        $scope.mapInfo = undefined;
        $scope.mapTitle = undefined;
        $scope.areaChange = undefined;
        $scope.hideDrawer = true;
        $scope.mainMenu = false;
        $scope.card = undefined;
        $scope.currentEvent = undefined;
        $scope.mapEditor = false;
        
        $scope.tutorial = undefined;
    }
    
    $scope.mainMenu = true;
    $scope.createGame = function() {
        console.log("Creating game");
        $scope.resetUI();
        resetGameLog({});
        $scope.map = new pocketciv.MapBuild();
        $scope.deck = new pocketciv.DeckBuild();
        $scope.engine = new pocketciv.EngineBuild(pocketimpl, $scope.map, $scope.deck);
        
        $scope.engine.map.grid = []
        for (var i = 0; i < 16; i++)
        {
            $scope.engine.map.grid.push([]);
            for (var j = 0; j < 16; j++)
            {
                $scope.engine.map.grid[i].push(-1);
            }
        }
        $scope.engine.map.width = 10;
        $scope.engine.map.height = 10;
        
        $scope.mapHex = new Map($scope.engine.map);
        $scope.mapArea = _.clone($scope.mapHex);
        $scope.mapArea.width = Math.ceil($scope.mapArea.width - 80);
        $scope.mapArea.height -= 40;
        $("canvas").attr("width", Math.ceil($scope.mapHex.width - 80))
        $("canvas").attr("height", $scope.mapHex.height - 40)
        //$scope.$apply();
        $scope.mapHex.getCanvas = getCanvas;
        $scope.mapHex.getImage = getImage;
        
        $scope.welcome = false;
        $scope.mapEditor = true;
        engine = $scope.engine;
    };
    
    $scope.load = function(scen, name, gameLog) {
        console.log("Loading "+name);
        $scope.resetUI();
        resetGameLog(scen);
        $scope.map = new  pocketciv.MapBuild();
        $scope.deck = new pocketciv.DeckBuild();
        $scope.engine = new pocketciv.EngineBuild(pocketimpl, $scope.map, $scope.deck);
        name = name || scen.name || "";
        if (_.has(scenarios, name))
        {
            var scenario = scenarios[name];
            _.each(scenario, function(s, sk) {
                if (!_.has(scen, sk)) scen[sk] = s;
            });
        }
        $scope.engine.init(scen);
        
        $scope.mapHex = new Map($scope.engine.map);
        $scope.mapArea = _.clone($scope.mapHex);
        $scope.mapArea.width = Math.ceil($scope.mapArea.width - 80);
        $scope.mapArea.height -= 40;
        $("canvas").attr("width", Math.ceil($scope.mapHex.width - 80))
        $("canvas").attr("height", $scope.mapHex.height - 40)
        //$scope.$apply();
        $scope.mapHex.getCanvas = getCanvas;
        $scope.mapHex.getImage = getImage;
        
        $scope.welcome = false;
        engine = $scope.engine;
    };
    
    var paintMap = function(map) {
        $('#map .areaCode').hide();
        map.paint();
        for (var reg in map.regions)
        {
            if (map.regions[reg].length)
                $('#area'+reg).css({top: map.symbols[reg]['area'].Y, left: map.symbols[reg]['area'].X }).show()
        }
    }
            
    $scope.$watch('engine.map', function() {
        if (!$scope.mapHex)
            return;
        if (!$scope.mapHex.painted)
            paintMap($scope.mapHex)
        var map = $scope.mapHex;
        console.log("Hey! Map changed!")
        $("#canvases .wonder").hide();
        $("#canvases .icon, #canvases .symbol").remove();
        for (var reg in $scope.map.areas)
        {
            var area = $scope.map.areas[reg];
            if (!(reg in map.symbols))
                continue
            
            _.each($scope.map.areas[reg], function(val, prop) {
                if (prop == "wonders")
                {
                    _.each(val, function(w) {
                        drawElem(w, reg, true);
                        if (w == "wall")
                            map.drawWall(reg);
                    })
                } else if (!(prop in map.symbols[reg])) {
                    return;
                } else {
                    drawElem(prop, reg, val);
                }
            })
            if (_.contains(area.wonders, 'atlantis') && area.city > 0)
                $("#city"+reg).addClass("atlantis");
        }
    }, true)
    
    $scope.$watch('engine.map.grid', function(map) {
        if (!$scope.map)
            return;
        console.log("Hey! Map GRID changed!");
        paintMap($scope.mapHex);
    }, true);
    
    $scope.$watch('engine.state', function(val) {
        if (val.phase) {
            $scope.$storage.current = val;
            $scope.saved = false;
        }
    }, true);
    
    $scope.$watch('engine.actions', function(val) {
        if (_.size(val) > 5)
        {
            $scope.manyActions = true;
        }
    }, true);
        
    $scope.saveName = "";
    $scope.saved = false;
    $scope.save = function(saveName) {
        $http.post('game/add', $scope.$storage.current).success(function(data) {
            $scope.saved = { 'id': data._id, 'slug': data.slug };
        }).error(function(data) {
            alert("Save failed!")
            $scope.saved = false;
        });
    }
    
    $scope.bugDescr = undefined;
    $scope.sendBug = function() {
        console.log("Sending bug")
        var gLog = _.clone($localStorage.gameLog)
        gLog.comment = $scope.bugDescr;
        //gLog.engine = $scope.engine;
        $http.post('gamelog/add', gLog).success(function(data) {
            $scope.bugSent = true;
            setTimeout(function() { $scope.bugSent = false; }, 3000);
        })
    }
    
    $(document).ready(function() {
        if (gameId)
        {
            // Load given game
            $http.get('/game/'+gameId).success(function(data) {
                console.log("Loaded game from server: ");
                console.log(data);
                $scope.load(data, data.name);
            });
        }
        
        $("#rightAction").on("click", "> div > h2", function() {
            var $par = $(this).parent();
            $par.toggleClass("away");
        });
        
        $("body").removeClass("initiating")
        setTimeout(function() {
            $(".menu-arrow").height($("#welcome p:nth(1)").position().top);
        }, 1500);
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
            close: "&close",
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
                d = d.replace(/{{ ([a-z_.]+) }}/g, "{{{ $1 }}}")
                
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
                if (ctx.event && ctx.event.expr) {
                    rctx.event = _.clone(ctx.event);
                    rctx.event.expr = "<span class='expr "+exprcss(ctx.event.expr)+"'>"+ctx.event.expr+"</span>";
                }
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
        if (ctx.event.expr) {
            rctx.event = _.clone(ctx.event);
            rctx.event.expr = "<span class='expr "+exprcss(ctx.event.expr)+"'>"+ctx.event.expr+"</span>";
        }
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

function exprcss(str) {
    return str.replace("2*h","hh").replace("2*s","ss").replace("2*c","cc").replace("3*s","sss").replace("3*h","hhh").replace("+","").replace("+","");
}

pocketcivApp.filter('exprcss', function() {
    return function(str, params) {
        if (str == undefined) return "";
        return exprcss(str);
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
