var pocketcivApp = angular.module('pocketcivApp');

pocketcivApp.directive('pcTechtree', function() {
    return {
        restrict: 'E',
        scope: {
            //'selAdv': "=",
            'advances': "=",
            'acquired': "=",
            'engine': "=",
            'acquirer': "=",
            'areas': "=",
        },
        //replace: true,
        templateUrl: 'app/techtree/techtree.html',
        link: function($scope, tElem) {
            console.log("LINK tecthree")
            $scope._ = _;
            $scope.$watch("acquirer", function(acq) {
                if (acq) {
                    console.log("Update possible advances to")
                    $scope.possibleAdvances = acq.possibleAdvances;
                    console.log($scope.possibleAdvances);
                }
            });
            $scope.getAcquireClasses = function(key) {
                var ret = [];
                if (($scope.acquired && $scope.acquired.indexOf(key) > -1) ||
                    ($scope.acquirer && $scope.acquirer.acquired[key]))
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
            $scope.selectAdv = function(adv) {
                $scope.selAdv = adv;
                $scope.selArea = undefined;
                $scope.selEvent = undefined;
                console.log(adv)
                if ($scope.possibleAdvances) {
                    if (!$scope.possibleAdvances[adv.name]) return;
                    if ($scope.possibleAdvances[adv.name].areas.length == 1)
                        $scope.selArea = $scope.engine.map.areas[$scope.possibleAdvances[adv.name].areas[0]];
                }
            }
            $scope.totalCity = function() { return _.reduce($scope.areas, function(memo, a) { return a.city ? memo + a.city : memo; }, 0); };
    
            $scope.selectEvent = function(ev) {
                $scope.selEvent = null;
                if (ev)
                    setTimeout(function() {
                        $scope.selEvent = ev
                        $scope.$apply();
                    }, 10)
            }
        }
    }
})