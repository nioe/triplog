'use strict';

var triplogApp = angular.module('triplogApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTouch',
    'LocalStorageModule',
    'angular-google-analytics',
    require('modules/welcome').name,
    require('modules/content').name,
    require('modules/tripsResource').name,
    require('modules/loginResource').name,
    require('modules/config').name
]);

triplogApp.config(function ($stateProvider, $urlRouterProvider, AnalyticsProvider, GOOGLE_ANALYTICS_TRACKING_CODE) {

    $urlRouterProvider.otherwise(function ($injector) {
        var localStorageService = $injector.get('localStorageService'),
            $state = $injector.get('$state'),
            lastState = localStorageService.get('lastState');

        if (lastState) {
            $state.go(lastState.state.name, lastState.params);
        } else {
            $state.go('welcome');
        }
    });

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
            data: {
                transitionSelectorClass: 'content'
            },
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
                pageTitle: 'Trip Overview'
            }
        })
        .state('content.stepOverview', {
            url: '/trip/:tripId',
            templateUrl: require('./content/stepOverview/stepOverview.tpl.html').name,
            controller: require('./content/stepOverview/stepOverview.controller'),
            controllerAs: 'stepOverview',
            resolve: {
                trip: function (TripsService, $stateParams) {
                    return TripsService.getTripById($stateParams.tripId);
                }
            }
        })
        .state('content.stepOfTrip', {
            url: '/trip/:tripId/step/:stepId',
            templateUrl: require('./content/stepDetail/stepDetail.tpl.html').name,
            data: {
                pageTitle: 'Step'
            },
            controller: require('./content/stepDetail/stepDetail.controller'),
            controllerAs: 'stepDetail'
        })
        .state('content.login', {
            url: '/login',
            templateUrl: require('./content/login/login.tpl.html').name,
            data: {
                pageTitle: 'Login'
            },
            controller: require('./content/login/login.controller'),
            controllerAs: 'login'
        });

    AnalyticsProvider.setAccount(GOOGLE_ANALYTICS_TRACKING_CODE);
    AnalyticsProvider.startOffline(true);
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');
});

triplogApp.run(['$rootScope', '$state', '$stateParams', '$timeout', '$window', 'localStorageService', 'Analytics', 'LoginService', function ($rootScope, $state, $stateParams, $timeout, $window, localStorageService, Analytics, LoginService) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.alerts = [];

    $rootScope.isOnline = $window.navigator.onLine;

    if ($rootScope.isOnline) {
        Analytics.offline(false);
        Analytics.createAnalyticsScriptTag();
        $rootScope.scriptTagCreated = true;
    }

    $window.addEventListener('offline', function () {
        $rootScope.$apply(function () {
            $rootScope.isOnline = false;
            Analytics.offline(true);
        });
    }, false);

    $window.addEventListener('online', function () {
        $rootScope.$apply(function () {
            $rootScope.isOnline = true;
            Analytics.offline(false);

            if (!$rootScope.scriptTagCreated) {
                Analytics.createAnalyticsScriptTag();
                $rootScope.scriptTagCreated = true;
            }
        });
    }, false);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        // Special Animations
        if (toState.name === 'welcome' || fromState.name === 'welcome') {
            $rootScope.animationClass = 'welcomeAnimation';
        } else {
            $rootScope.animationClass = undefined;
        }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        fromParams.referrerState = undefined;
        toParams.referrerState = {state: fromState, params: fromParams};

        localStorageService.set('lastState', {
            state: toState,
            params: toParams
        });
    });

    $rootScope.$on('$viewContentLoaded', function() {
        $timeout(function() {
            $rootScope.hideStartScreen = true;
        }, 0);
    });

    LoginService.checkPresentToken();
}]);