var pocketciv = require("../../pocketciv");
var pocketcivApp = angular.module('pocketcivApp', []);

function getMovement(areas) {
    return _.object(_.map(pocketciv.Map.areas, function (area, id) {
        return [id, area.tribes];
    }));
}

pocketcivApp.controller('MainGame', function ($scope) {
    pocketciv.Map.areas =
    {
    "1": {
        "id": 1,
        "neighbours": [ 3, 4, 8, 'frontier' ],
        "forest": true
    },
    "2": {
        "id": 2,
        "desert": true,
        "neighbours": [ 3, 5, 8, 'sea', 'frontier' ] 
    },
    "3": {
        "id": 3,
        "desert": true,
        "neighbours": [ 1, 2, 4, 8, 'frontier' ],
    },
    "4": {
        "id": 4,
        "desert": true,
        "neighbours": [ 1, 3, 'frontier' ] 
    },
    "5": {
        "id": 5,
        "tribes": 1,
        "neighbours": [ 2, 7, 'sea' ],
        "mountain": true
    },
    "7": {
        "id": 7,
        "neighbours": [ 5, 8, 'sea' ],
        "forest": true
    },
    "8": {
        "id": 8,
        "neighbours": [ 1, 2, 3, 7, 'sea', 'frontier' ],
        "forest": true,
        "mountain": true
    }
    };
    pocketciv.Map.width = 9
    pocketciv.Map.height = 9
    pocketciv.Map.grid = [
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1, 0, 1, 1, 0, 0, 0, 0 ],
        [-1,-1, 8, 8, 1, 1, 4, 4, 0 ],
        [-1,-1,-1, 7, 8, 3, 4, 4, 0 ],
        [-1,-1, 7, 7, 0, 8, 3, 3, 0 ],
        [-1,-1, 5, 7, 0, 0, 2, 3, 0 ],
        [-1,-1, 5, 5, 5, 2, 2, 2, 0 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        ];
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
        } else {
            console.log("FAILED MOVE")
        }
    }
    $scope.hideMover = true;
    
    var drawnFunc = undefined;
    $scope.hideDrawer = true;
    $scope.drawCard = function() {
        $scope.card = $scope.deck.draw;
        $scope.card = pocketciv.EventDeck.specific(6);
        $scope.hideDrawer = true;
        drawnFunc.call(pocketciv.Engine, $scope.card);
    }
    
    pocketciv.Engine.mover = function(situation, move) {
        console.log("Show mover")
        $scope.movement = getMovement(situation);
        $scope.hideMover = false;
        moveFunc = move;
    }
    
    var reduceFunc = undefined;
    $scope.hideReducer = true;
    pocketciv.Engine.reducer = function(t, amount, areas, done) {
        console.log("Show reducer for "+t)
        $scope.hideReducer = false;
        $scope.reduceAmount = amount;
        $scope.reduceAreas = areas;
        $scope.reductions = {};
        reduceFunc = done;
    }
    
    $scope.reduceTribes = function() {
        reduceFunc.call($scope.engine, $scope.reductions);
        $scope.hideReducer = true;
    }
    
    pocketciv.Engine.drawer = function(deck, drawn) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
        drawnFunc = drawn;
    }
    
    $scope.areaChangeOk = function() {
        $scope.areaChange = undefined;
        areaChangeDone.call($scope.engine);
    }
    
    var areaChangeDone = undefined;
    pocketciv.Engine.areaChanger = function(changes, done) {
        $scope.areaChange = changes;
        areaChangeDone = done;
    }
    
    $scope.possibleAreas = []
    $scope.selectedArea = undefined;
    var areaSelect = undefined;
    $scope.selectArea = function() {
        areaSelect.call(pocketciv.Engine, $scope.selectedArea);
        $scope.possibleAreas = []
    }
    pocketciv.Engine.areaSelector = function(possibleAreas, select)
    {
        $scope.possibleAreas = possibleAreas;
        areaSelect = select;
    }
    
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
    
    $scope.engine = pocketciv.Engine;
    $scope.engine.phase = "populate";
    $scope.engine.era = 1
    $scope.engine.acquired = {
        //'literacy': pocketciv.Advances['literacy'],
        //'agriculture': pocketciv.Advances['agriculture'],
    }
    
    var map = new Map(pocketciv.Map);
    $scope.mapArea = map
    map.getCanvas = function(i) {
        return $('#mapCanvas'+i)[0];
    }
    map.getImage = function(i) {
        return $('#mapImage'+i)[0];
    }
    angular.element(document).ready(function() {
        map.paint();
        for (var reg in map.symbols)
        {
            $('#area'+reg).css({top: map.symbols[reg]['area'].Y, left: map.symbols[reg]['area'].X }).show()
        }
    })
    $scope.$watch('map', function() {
        console.log("Hey! Map changed!")
        for (var reg in $scope.map.areas)
        {
            if (!(reg in map.symbols))
                continue
            
            for (var prop in $scope.map.areas[reg])
            {
                if (!(prop in map.symbols[reg]))
                    continue;
                    
                var $elem = $('#'+prop+reg);
                var val = $scope.map.areas[reg][prop];
                
                if ($elem.length == 0 && val)
                {
                    $elem = $('#'+prop).clone().attr('id', prop+reg).appendTo("#canvases")
                    $elem.css({ top: map.symbols[reg][prop].Y, left: map.symbols[reg][prop].X})
                }
                if ($elem.length > 0 && !val)
                    $elem.remove()
                else
                    $elem.html($scope.map.areas[reg][prop]).show()
            }
        }
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
          return lastValid;
        }
      }

      function toUser(object) {
        // better than JSON.stringify(), because it formats + filters $$hashKey etc.
        return angular.toJson(object, true);
      }
    }
  };
});