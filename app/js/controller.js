var pocketciv = require("../../core/pocketciv");
var pocketcivApp = angular.module('pocketcivApp', ['ngStorage']);
var runplay = require("../../core/runplay")

pp = pocketciv

function getMovement(areas) {
    return _.object(_.map(pocketciv.Map.areas, function (area, id) {
        return [id, area.tribes ? area.tribes : 0 ];
    }));
}

gameLog = {
    "move": [],
    "deck": [],
    "reduce": [],
    "areas": [],
    "advance": []
};

var scenarios = {
    "1": require("../scenarios/scenario1")
}

pocketcivApp.controller('MainGame', function ($scope, $localStorage) {
    $scope.$storage = $localStorage;
    $scope.map = pocketciv.Map;
    $scope.deck = pocketciv.EventDeck;
    
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
            $scope.reduceArray = {};
            var areas = $scope.reducer.areas();
            _.each(areas, function(area) {
                $scope.reduceArray[area.id] = { 'tribes': 0 }
            });
            $scope.reduceAreas = areas;
        }
        else
            $scope.reduceArray = [];
        reduceFunc = done;
        checkReducer();
    }
    var checkReducer = function() {
        console.log('reduce array change')
        console.log($scope.reduceArray)
        if ($scope.hideReducer)
            return;
        var ok = $scope.reducer.ok($scope.reduceArray);
        if ($scope.reducer.mode == 'AreaWalker')
        {
            $scope.reduceAreas = ok.areas;
            if (! $scope.reduceAreas)
            {
                $scope.hideReducer = true;
                reduceFunc(ok);
                gameLog.reduce.push($scope.reduceArray)
            }
        } else {
            $scope.reducer.amount = ok.amount;
        }
    };
    $scope.reduceReady = function() {
        var arr = _.filter(_.keys($scope.reduceArray), function(k) {
            return $scope.reduceArray[k]['tribes'] != "0";
        })
        var ok = $scope.reducer.ok(_.pick($scope.reduceArray, arr));
        if (ok.ok != false)
        {
            $scope.hideReducer = true;
            reduceFunc(ok);
            gameLog.reduce.push($scope.reduceArray)
        }
    }
    $scope.$watchCollection('reduceArray', checkReducer);
    $scope.$watch('reduceArray', checkReducer, true);
    
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
    
    // End region functions
    
    $scope.possibleAreas = []
    $scope.selectedArea = undefined;
    var areaSelect = undefined;
    $scope.selectArea = function() {
        $scope.possibleAreas = []
        mapClicked = oldClicked;
        $scope.mapInfo = undefined;
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
    pocketciv.Engine.advanceAcquirer = function(engine, done) {
        $scope.acquirer = new pocketciv.AdvanceAcquirer(engine);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
        doAcquire = done;
    }
    
    $scope.acquireGo = function() {
        $scope.acquirer.acquire($scope.acquire_name, $scope.acquire_area);
        $scope.possibleAdvances = $scope.acquirer.possibleAdvances();
        $scope.acquired = _.map($scope.acquirer.acquired, function(v) {
            return v.title;
        });
    }
    
    $scope.acquireOk = function() {
        doAcquire.call($scope.engine, $scope.acquirer.acquired)
        $scope.possibleAdvances = undefined;
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
    
    $scope.engine = pocketciv.Engine;
    $scope.engine.phase = "";
    $scope.godMode = false;
    
    var map = new Map(pocketciv.Map);
    $scope.mapArea = map
    
    map.getCanvas = function(i) {
        return [$('#mapCanvas'+i)[0],
                $('#focusCanvas'+i).get(0),
                $('#activeCanvas'+i).get(0)];
    }
    map.getImage = function(i) {
        return $('#mapImage'+i)[0];
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
    
    angular.element(document).ready(function() {
        map.paint();
        for (var reg in map.symbols)
        {
            $('#area'+reg).css({top: map.symbols[reg]['area'].Y, left: map.symbols[reg]['area'].X }).show()
        }
    })
    
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
    
    $scope.$watch('map', function() {
        console.log("Hey! Map changed!")
        pocketciv.Map.areas = $scope.map.areas
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
    })
});

pocketciv.Engine.init(scenarios["1"]);

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
