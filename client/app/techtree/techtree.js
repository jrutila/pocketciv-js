var pocketcivApp = angular.module('pocketcivApp');
var AdvanceAcquirer = require("../../../src/actions/acquire").AdvanceAcquirer;
var WonderBuilderer = require("../../../src/actions/build").WonderBuilderer;

pocketcivApp.directive('pcTechtree', function() {
    return {
        restrict: 'E',
        scope: {
            'selected': "=",
            //'advances': "=",
            //'acquired': "=",
            'engine': "=",
            'acquirer': "=",
            'builder': "=",
            'acquiring': "=",
            //'areas': "=",
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
                    $scope.selected.advance && $scope.autoSelectArea($scope.selected.advance);
                }
            });
            $scope.$watch("builder", function(bui) {
                if (bui) {
                    console.log("Update possible wonders to")
                    $scope.possibleWonders = bui.possibleWonders;
                }
            });
            $scope.getAcquireClasses = function(key) {
                var ret = [];
                if ($scope.acquirer && _.contains($scope.acquirer.acquired, key))
                    ret.push("acquired");
                if ($scope.acquirer && _.any($scope.acquirer.nowacquired, function(acq) { return acq.name == key }))
                    ret.push("now");
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
                        var a = $scope.acquirer.advances[ad];
                        return a ? a.title : ad;
                    }).join(" or ");
                }).join(" and ");
            }
            $scope.resetAcquires = function() {
                $scope.acquirer = new AdvanceAcquirer($scope.engine);
            }
            $scope.resetBuilds = function() {
                $scope.builder = new WonderBuilderer($scope.engine);
            }
            $scope.nowAcquired = function() {
                return $scope.acquirer ? 
                    _.map($scope.acquirer.nowacquired, function(a,k) { return [k,a.title]})
                    : "Not acquiring";
            }
            $scope.autoSelectArea = function(adv) {
                if ($scope.possibleAdvances) {
                    if (!$scope.possibleAdvances[adv.name]) return;
                    if ($scope.possibleAdvances[adv.name].areas.length == 1)
                        $scope.selArea = $scope.acquirer.areas[$scope.possibleAdvances[adv.name].areas[0]];
                }
            }
            $scope.selectAdv = function(adv) {
                $scope.selAdv = adv;
                $scope.selected.advance = adv;
                $scope.selArea = undefined;
                $scope.selEvent = undefined;
                $scope.autoSelectArea(adv);
            }
            
            $scope.advArea = function(area) {
                if (
                    $scope.selAdv && 
                    $scope.possibleAdvances[$scope.selAdv.name].areas.indexOf(area.id.toString()) > -1)
                    $scope.selArea = area;
            }
    
            $scope.selectEvent = function(ev) {
                $scope.selEvent = null;
                if (ev)
                    setTimeout(function() {
                        $scope.selEvent = ev
                        $scope.$apply();
                    }, 10)
            }
            
            $scope.acquire = function() {
                $scope.acquirer.acquire($scope.selAdv.name, $scope.selArea.id);
                $scope.possibleAdvances = $scope.acquirer.possibleAdvances;
            }
            $scope.buildWon = function(name, area) {
                $scope.builder.build(name, area);
                $scope.possibleWonders = $scope.builder.possibleWonders;
            }
        }
    }
})
pocketcivApp.filter("orderAdvances", function() {
    return function(input,poss,acquired) {
        return _.sortBy(_.sortBy(input, 'name'), function(i) {
            if (_.has(poss, i.name)) return poss[i.name].areas.length || 9;
            if (_.contains(acquired, i.name)) return 11;
            return 10;
        });
    }
})