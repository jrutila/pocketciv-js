var pocketcivApp = angular.module('pocketcivApp');

pocketcivApp.directive('pcReducer', function() {
    return {
        restrict: 'E',
        scope: {
            'reducer': "=reducer",
            'ready': "=ready"
        },
        replace: true,
        templateUrl: 'app/reducer/reducer.html',
        link: function($scope, tElem) {
            $scope.reset = function() {
                if ($scope.reducer.opts.edits && $scope.reducer.opts.edits.length > 0)
                    $scope.chg = {};
                else
                    $scope.chg = [];
            };
            $scope.$watch('reducer', function(n, o) {
                console.log("PC REDUCER")
                if (n != o && n != undefined)
                    $scope.reset();
            });
            $scope.$watch("chg", function() {
                console.log("Change chg "+$scope.chg)
                if ($scope.reducer)
                    $scope.ok = $scope.reducer.ok($scope.chg);
                else
                    $scope.ok = {};
                console.log($scope.ok)
            }, true);
            $scope.done = function() {
                var ok = $scope.reducer.ok($scope.chg);
                console.log(ok)
                if (ok.ok)
                {
                    $scope.reducer = undefined;
                    $scope.ok = undefined;
                    $scope.ready(ok.changes);
                }
            }
            $scope.selectChange = function(a) {
                /*
                console.log("Select change "+a);
                if (_.isArray($scope.chg))
                    $scope.chg.splice($scope.chg.indexOf(a));
                else
                    delete $scope.chg[a];
                    */
            }
            $scope.selectArea = function(a) {
                a = parseInt(a);
                console.log("Selected area "+a)
                if (_.isArray($scope.chg))
                {
                    if (!_.contains($scope.chg, a))
                        $scope.chg.push(a);
                } else {
                    console.log("no reason to select area. only UI")
                }
                console.log($scope.chg)
            }
        }
    }
});