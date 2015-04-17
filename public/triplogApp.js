'use strict';

var triplogApp = angular.module("triplogApp", [
    'ui.router'
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
            templateUrl: "modules/welcome/welcome.tpl.html"
        })
        .state('content', {
            url: "/content",
            templateUrl: "modules/content/content.tpl.html",
            abstract: true
        })
        .state('content.trip', {
            url: "/trip",
            templateUrl: "modules/content/trip/tripOverview.tpl.html"
        })
        .state('content.allStepsOfTrip', {
            url: "/trip/:tripId",
            templateUrl: "modules/content/step/stepOverview.tpl.html"
        })
        .state('content.step', {
            url: "/trip/:tripId/step/:stepId",
            templateUrl: "modules/content/step/stepDetail.tpl.html"
        });
});