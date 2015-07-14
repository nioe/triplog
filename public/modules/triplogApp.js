'use strict';

var triplogApp = angular.module('triplogApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTouch',
    require('./welcome/welcome.module').name,
    require('./content/content.module').name,
    require('./content/trip/trip.module').name,
    require('./content/stepOverview/stepOverview.module').name,
    require('./content/stepDetail/stepDetail.module').name,
    require('./resource/trips/tripsResource.module').name
]);

triplogApp.config(function ($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /welcome
    $urlRouterProvider.otherwise('/welcome');

    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: require('./welcome/welcome.tpl.html').name,
            data: {
                pageTitle: 'Welcome',
                transitionSelectorClass: 'welcome'
            }
        })
        .state('content', {
            url: '/content',
            abstract: true,
            templateUrl: require('./content/content.tpl.html').name,
            controller: require('./content/content.controller'),
            controllerAs: 'content',
            resolve: {
                trips: function (TripsService) {
                    return TripsService.getAllTrips();
                }
            }
        })
        .state('content.allTrips', {
            url: '/trip',
            templateUrl: require('./content/trip/tripOverview.tpl.html').name,
            data: {
                pageTitle: 'Trip Overview',
                transitionSelectorClass: 'content'
            }
        })
        .state('content.allStepsOfTrip', {
            url: '/trip/:tripId',
            templateUrl: require('./content/stepOverview/stepOverview.tpl.html').name,
            data: {
                transitionSelectorClass: 'content'
            },
            controller: require('./content/stepOverview/stepOverview.controller'),
            controllerAs: 'stepOverview'
        })
        .state('content.stepOfTrip', {
            url: '/trip/:tripId/step/:stepId',
            templateUrl: require('./content/stepDetail/stepDetail.tpl.html').name,
            data: {
                pageTitle: 'Step',
                transitionSelectorClass: 'content'
            },
            controller: require('./content/stepDetail/stepDetail.controller'),
            controllerAs: 'stepDetail'
        });
});

triplogApp.run(['$rootScope', '$state', '$stateParams', '$window', function ($rootScope, $state, $stateParams, $window) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.isOnline = $window.navigator.onLine;

    $window.addEventListener('offline', function () {
        $rootScope.$apply(function () {
            $rootScope.isOnline = false;
        });
    }, false);

    $window.addEventListener('online', function () {
        $rootScope.$apply(function () {
            $rootScope.isOnline = true;
        });
    }, false);
}]);