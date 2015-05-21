'use strict';

var triplogApp = angular.module('triplogApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTouch',
    require('./welcome/welcome.module').name,
    require('./content/content.module').name,
    require('./content/trip/trip.module').name,
    require('./content/step/step.module').name
]);

triplogApp.config(function($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /welcome
    $urlRouterProvider.otherwise('/welcome');

    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: require('./welcome/welcome.tpl.html').name,
            data : {
                pageTitle: 'Welcome',
                transitionSelectorClass: 'welcome'
            }
        })
        .state('content', {
            url: '/content',
            abstract: true,
            templateUrl: require('./content/content.tpl.html').name,
            controller: require('./content/content.controller'),
            controllerAs: 'content'
        })
        .state('content.allTrips', {
            url: '/trip',
            templateUrl: require('./content/trip/tripOverview.tpl.html').name,
            data : {
                pageTitle: 'Trip Overview',
                transitionSelectorClass: 'content'
            }
        })
        .state('content.allStepsOfTrip', {
            url: '/trip/:tripId',
            templateUrl: require('./content/step/stepOverview.tpl.html').name,
            data : {
                transitionSelectorClass: 'content'
            },
            controller: function($scope, $state, $stateParams) {
                $scope.tripId = $stateParams.tripId;
                $state.current.data.pageTitle = 'Trip ' + $stateParams.tripId;
            }
        })
        .state('content.stepOfTrip', {
            url: '/trip/:tripId/step/:stepId',
            templateUrl: require('./content/step/stepDetail.tpl.html').name,
            data : {
                pageTitle: 'Step',
                transitionSelectorClass: 'content'
            }
        });
});

triplogApp.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
]);