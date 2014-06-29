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
    $scope.movement = getMovement(pocketciv.Map.areas);
    $scope.map = pocketciv.Map;
    $scope.deck = pocketciv.EventDeck;
    
    $scope.moveTribes = function() {
        var mover = new pocketciv.TribeMover(pocketciv.Map.areas);
        mover.init(getMovement(pocketciv.Map.areas));
        if (mover.ok($scope.movement))
        {
            console.log("OK MOVE!");
            pocketciv.Map.moveTribes($scope.movement);
            $scope.map = pocketciv.Map;
        } else {
            console.log("FAILED MOVE")
        }
    }
    
    $scope.drawCard = function() {
        $scope.card = pocketciv.EventDeck.draw();
    }
});