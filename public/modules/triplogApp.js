'use strict';

var triplogApp = angular.module("triplogApp", [
    'ui.router',
    'ngAnimate',
    require('./welcome/welcome.module').name,
    require('./content/content.module').name,
    require('./content/trip/trip.module').name,
    require('./content/step/step.module').name
]);

triplogApp.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/welcome");
    //
    // Now set up the states
    $stateProvider
        .state('welcome', {
            url: "/welcome",
            templateUrl: require('./welcome/welcome.tpl.html').name
        })
        .state('content', {
            url: "/content",
            templateUrl: require('./content/content.tpl.html').name,
            abstract: true
        })
        .state('content.trip', {
            url: "/trip",
            templateUrl: require('./content/trip/tripOverview.tpl.html').name
        })
        .state('content.allStepsOfTrip', {
            url: "/trip/:tripId",
            templateUrl: require('./content/step/stepOverview.tpl.html').name,
            controller: function($scope, $stateParams) {
                $scope.tripId = $stateParams.tripId;
            }
        })
        .state('content.step', {
            url: "/trip/:tripId/step/:stepId",
            templateUrl: require('./content/step/stepDetail.tpl.html').name
        });
});