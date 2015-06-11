var pocketcivApp = angular.module('pocketcivApp');

pocketcivApp.directive('pcMapeditor', function() {
    return {
        restrict: 'E',
        scope: {'map': '='},
        templateUrl: 'app/mapeditor/mapeditor.html',
        controller: function($scope, hotkeys) {
            $scope.selectEdit = function(select) {
                console.log("Editing "+select)
                $scope.editing = select;
            }
            $scope.$on("hexClick", function(event, hex) {
                console.log(hex);
                $scope.map.grid[hex.Y][hex.X] = $scope.editing;
            });
            
            var hk = hotkeys.bindTo($scope)
            _.each([0,1,2,3,4,5,6,7,8,9], function(i) {
                hk.add({
                    combo: i.toString(),
                    callback: function() {
                        $scope.selectEdit(i < 9 ? i : -1);
                    }
                })
            });
        }
    }
});