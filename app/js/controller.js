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
        "tribes": 1,
        "neighbours": [ 2 ] 
    },
    "2": {
        "tribes": 0,
        "neighbours": [ 1, 3 ] 
    },
    "3": {
        "tribes": 0,
        "neighbours": [ 2, 4, 5 ] 
    },
    "4": {
        "tribes": 0,
        "neighbours": [ 3, 5 ] 
    },
    "5": {
        "tribes": 0,
        "neighbours": [ 3, 4 ] 
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
            moveFunc = undefined;
        } else {
            console.log("FAILED MOVE")
        }
    }
    $scope.hideMover = true;
    
    var drawnFunc = undefined;
    $scope.hideDrawer = true;
    $scope.drawCard = function() {
        $scope.card = $scope.deck.draw();
        $scope.hideDrawer = true;
        drawnFunc.call(pocketciv.Engine, $scope.card);
        drawnFunc = undefined;
    }
    
    pocketciv.Engine.mover = function(situation, move) {
        console.log("Show mover")
        $scope.movement = getMovement(situation);
        $scope.hideMover = false;
        moveFunc = move;
    }
    
    pocketciv.Engine.drawer = function(deck, drawn) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
        drawnFunc = drawn;
    }
    
    $scope.engine = pocketciv.Engine;
});