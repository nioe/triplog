'use strict';

var triplogApp = angular.module('triplogApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTouch',
    'LocalStorageModule',
    'angular-google-analytics',
    require('modules/loadingSpinner').name,
    require('modules/welcome').name,
    require('modules/content').name,
    require('modules/tripsResource').name,
    require('modules/stepsResource').name,
    require('modules/loginResource').name,
    require('modules/error').name,
    require('modules/alert').name,
    require('modules/config').name
]);

triplogApp.config(function ($stateProvider, $urlRouterProvider, AnalyticsProvider, GOOGLE_ANALYTICS_TRACKING_CODE) {

    $urlRouterProvider.when('', function ($injector) {
        var localStorageService = $injector.get('localStorageService'),
            $state = $injector.get('$state'),
            lastState = localStorageService.get('lastState');

        if (lastState) {
            $state.go(lastState.state.name, lastState.params);
        } else {
            $state.go('welcome');
        }
    });

    $urlRouterProvider.otherwise('/welcome');

    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: require('./welcome/welcome.tpl.html').name,
            data: {
                pageTitle: 'Welcome',
                transitionSelectorClass: 'welcome-transition'
            }
        })
        .state('content', {
            abstract: true,
            templateUrl: require('./content/content.tpl.html').name,
            controller: require('./content/content.controller'),
            controllerAs: 'content',
            data: {
                transitionSelectorClass: 'content-transition'
            },
            resolve: {
                checkLoginBefore: function(LoginService) {
                    return LoginService.checkPresentToken();
                },
                trips: function (checkLoginBefore, TripsService) {
                    return TripsService.getTrips();
                }
            }
        })
        .state('content.allTrips', {
            url: '/trips',
            templateUrl: require('./content/trip/tripOverview.tpl.html').name,
            data: {
                pageTitle: 'Trip Overview'
            }
        })
        .state('content.stepOverview', {
            url: '/trips/:tripId?edit',
            templateUrl: require('./content/stepOverview/stepOverview.tpl.html').name,
            controller: require('./content/stepOverview/stepOverview.controller'),
            controllerAs: 'stepOverview',
            resolve: {
                trip: function (checkLoginBefore, TripsService, $stateParams) {
                    return TripsService.getTrip($stateParams.tripId);
                }
            }
        })
        .state('content.stepOfTrip', {
            url: '/trips/:tripId/:stepId',
            templateUrl: require('./content/stepDetail/stepDetail.tpl.html').name,
            data: {
                pageTitle: 'Step'
            },
            controller: require('./content/stepDetail/stepDetail.controller'),
            controllerAs: 'stepDetail',
            resolve: {
                step: function (checkLoginBefore, StepsService, $stateParams) {
                    return StepsService.getStepOfTrip($stateParams.tripId, $stateParams.stepId);
                }
            }
        })
        .state('content.login', {
            url: '/login',
            templateUrl: require('./content/login/login.tpl.html').name,
            data: {
                pageTitle: 'Login'
            },
            controller: require('./content/login/login.controller'),
            controllerAs: 'login'
        })
        .state('content.notFound', {
            templateUrl: require('./content/error/notFound.tpl.html').name,
            data: {
                pageTitle: 'Not found'
            }
        });

    AnalyticsProvider.setAccount(GOOGLE_ANALYTICS_TRACKING_CODE);
    AnalyticsProvider.startOffline(true);
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');
});

triplogApp.run(['$rootScope', '$state', '$stateParams', '$timeout', '$document', '$window', 'localStorageService', 'Analytics', 'AlertService', 'ENV',
        function ($rootScope, $state, $stateParams, $timeout, $document, $window, localStorageService, Analytics, AlertService, ENV) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.alerts = [];

            $rootScope.isOnline = $window.navigator.onLine || ENV === 'local';

            if ($rootScope.isOnline && ENV !== 'local') {
                Analytics.offline(false);
                Analytics.createAnalyticsScriptTag();
                $rootScope.scriptTagCreated = true;
            }

            $window.addEventListener('offline', function () {
                $rootScope.$apply(function () {
                    if (ENV !== 'local') {
                        $rootScope.isOnline = false;
                        Analytics.offline(true);
                    }
                });
            }, false);

            $window.addEventListener('online', function () {
                $rootScope.$apply(function () {
                    if (ENV !== 'local') {
                        $rootScope.isOnline = true;
                        Analytics.offline(false);

                        if (!$rootScope.scriptTagCreated) {
                            Analytics.createAnalyticsScriptTag();
                            $rootScope.scriptTagCreated = true;
                        }
                    }
                });
            }, false);

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                // Special Animations
                if (toState.name === 'welcome' || fromState.name === 'welcome') {
                    $rootScope.animationClass = 'welcome-animation';
                } else {
                    $rootScope.animationClass = undefined;
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                // Scroll to top of content container after state change
                var contentContainer = $document[0].querySelector('.content-container');
                if (contentContainer) {
                    contentContainer.scrollTop = 0;
                }

                // Save current state to local storage
                fromParams.referrerState = undefined;
                toParams.referrerState = {state: fromState, params: fromParams};

                localStorageService.set('lastState', {
                    state: toState,
                    params: toParams
                });
            });

            $rootScope.$on('$viewContentLoaded', function () {
                $timeout(function () {
                    $rootScope.hideStartScreen = true;
                }, 0);
            });

            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                console.error('State Change Error:', error);

                switch (error.status) {
                    case 0:
                        AlertService.info('Oops, there was a problem loading the data. Please try again later.');
                        break;
                    case 404:
                        $state.go('content.notFound', {}, {reset: true});
                        break;
                    default:
                        AlertService.info(error.data);
                }
            });
        }]
);