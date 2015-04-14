'use strict';

myApp.controller("myCtrl",['$scope',function($scope) {
    $scope.message = "";
    $scope.left  = function() {return 200 - $scope.message.length;};
    $scope.clear = function() {$scope.message = "";};
}]);