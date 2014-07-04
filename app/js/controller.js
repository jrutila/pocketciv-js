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
        "tribes": 5,
        "city": 1,
        "neighbours": [ 2, 'sea' ],
        "forest": true
    },
    "2": {
        "id": 2,
        "tribes": 9,
        "city": 0,
        "neighbours": [ 1, 3, 'sea', 'frontier' ] 
    },
    "3": {
        "id": 3,
        "tribes": 5,
        "neighbours": [ 2, 4, 5, 'frontier' ],
        "farm": true,
        "forest": true
    },
    "4": {
        "id": 4,
        "tribes": 0,
        "neighbours": [ 3, 5, 'frontier' ] 
    },
    "5": {
        "id": 5,
        "tribes": 8,
        "city": 3,
        "neighbours": [ 3, 4, 6, 'frontier' ],
        "mountain": true
    },
    "6": {
        "id": 6,
        "tribes": 8,
        "city": 3,
        "neighbours": [ 5, 'frontier' ],
        "volcano": true
    }
    };
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
    pocketciv.Engine.tribeReducer = function(amount, areas, done) {
        console.log("Show reducer")
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
    $scope.engine.phase = "advance";
    $scope.engine.era = 4
    $scope.engine.acquired = {
        'literacy': pocketciv.Advances['literacy'],
        //'agriculture': pocketciv.Advances['agriculture'],
    }
});