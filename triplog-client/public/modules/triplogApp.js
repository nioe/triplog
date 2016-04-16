'use strict';

var triplogApp = angular.module('triplogApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTouch',
    'LocalStorageModule',
    'angular-google-analytics',
    'angular-scroll-animate',
    require('modules/loadingSpinner').name,
    require('modules/welcome').name,
    require('modules/content').name,
    require('modules/contentData').name,
    require('modules/loginResource').name,
    require('modules/error').name,
    require('modules/alert').name,
    require('modules/config').name,
    require('modules/sync').name
]);

triplogApp.config(function ($locationProvider, $stateProvider, $urlRouterProvider, AnalyticsProvider, GOOGLE_ANALYTICS_TRACKING_CODE) {

    $locationProvider.html5Mode(true);

    $urlRouterProvider.when('/', function ($injector) {
        var localStorageService = $injector.get('localStorageService'),
            $state = $injector.get('$state'),
            lastState = localStorageService.get('lastState');

        if (lastState) {
            $state.go(lastState.state.name, lastState.params);
        } else {
            $state.go('welcome');
        }
    });

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('welcome', {
            url: '/',
            templateUrl: require('./welcome/welcome.tpl.html'),
            data: {
                pageTitle: 'Welcome',
                transitionSelectorClass: 'welcome-transition'
            }
        })
        .state('content', {
            abstract: true,
            templateUrl: require('./content/content.tpl.html'),
            controller: require('./content/content.controller'),
            controllerAs: 'content',
            data: {
                transitionSelectorClass: 'content-transition'
            },
            resolve: {
                checkLoginBefore: function (LoginService) {
                    return LoginService.checkPresentToken();
                },
                loadTripsFromLocalStorage: function (checkLoginBefore, TripsService) {
                    return TripsService.ensureTripsAreFetched();
                }
            }
        })
        .state('content.tripOverview', {
            url: '/trips',
            templateUrl: require('./content/tripOverview/tripOverview.tpl.html'),
            data: {
                pageTitle: 'Trip Overview'
            }
        })
        .state('content.tripAdd', {
            url: '/trips/add-trip',
            templateUrl: require('./content/trip/trip.add.tpl.html'),
            controller: require('./content/trip/tripAdd.controller'),
            controllerAs: 'tripAdd',
            data: {
                pageTitle: 'Add Trip'
            }
        })
        .state('content.trip', {
            url: '/trips/:tripId?edit',
            templateUrl: require('./content/trip/trip.tpl.html'),
            controller: require('./content/trip/trip.controller'),
            controllerAs: 'trip',
            resolve: {
                loadTripFromLocalStorage: function (checkLoginBefore, LocalData, $stateParams, $q) {
                    return function () {
                        return $q(function (resolve, reject) {
                            var trip = LocalData.getTrip($stateParams.tripId);

                            if (trip) {
                                resolve(trip);
                            } else {
                                reject('Trip not found!');
                            }
                        });
                    };
                }
            }
        })
        .state('content.stepAdd', {
            url: '/trips/:tripId/add-step',
            templateUrl: require('./content/step/step.add.tpl.html'),
            data: {
                pageTitle: 'Add Step'
            },
            controller: require('./content/step/stepAdd.controller'),
            controllerAs: 'stepAdd'
        })
        .state('content.step', {
            url: '/trips/:tripId/:stepId?edit',
            templateUrl: require('./content/step/step.tpl.html'),
            data: {
                pageTitle: 'Step'
            },
            controller: require('./content/step/step.controller'),
            controllerAs: 'step',
            resolve: {
                ensureStepIsFetched: function(checkLoginBefore, StepsService, $stateParams) {
                    return StepsService.ensureStepIsFetched($stateParams.tripId, $stateParams.stepId);
                },
                loadStepFromLocalStorage: function (ensureStepIsFetched, LocalData, $stateParams, $q) {
                    return function() {
                        return $q(function (resolve, reject) {
                            var step = LocalData.getStep($stateParams.tripId, $stateParams.stepId);

                            if (step) {
                                resolve(step);
                            } else {
                                reject('Step not found');
                            }
                        });
                    };
                }
            }
        })
        .state('content.login', {
            url: '/login',
            templateUrl: require('./content/login/login.tpl.html'),
            data: {
                pageTitle: 'Login'
            },
            controller: require('./content/login/login.controller'),
            controllerAs: 'login'
        })
        .state('content.visitedCountries', {
            url: '/visited-countries',
            templateUrl: require('./content/visitedCountries/visitedCountries.tpl.html'),
            data: {
                pageTitle: 'Visited Countries'
            },
            controller: require('./content/visitedCountries/visitedCountries.controller'),
            controllerAs: 'visitedCountries'
        })
        .state('content.notFound', {
            templateUrl: require('./content/error/notFound.tpl.html'),
            data: {
                pageTitle: 'Not found'
            }
        });

    AnalyticsProvider.setAccount(GOOGLE_ANALYTICS_TRACKING_CODE);
    AnalyticsProvider.startOffline(true);
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');
});

triplogApp.run(['$rootScope', '$state', '$stateParams', '$timeout', '$window', 'localStorageService', 'Analytics', 'AlertService', 'ENV',
    function ($rootScope, $state, $stateParams, $timeout, $window, localStorageService, Analytics, AlertService, ENV) {

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
                    $rootScope.$broadcast('isOnline', false);
                }
            });
        }, false);

        $window.addEventListener('online', function () {
            $rootScope.$apply(function () {
                if (ENV !== 'local') {
                    $rootScope.isOnline = true;
                    Analytics.offline(false);
                    $rootScope.$broadcast('isOnline', true);

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
            // Scroll to top of page after state change
            $window.scrollTo(0, 0);

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
            switch (error.status) {
                case 0:
                    AlertService.info('Oops, there was a problem loading the data. Please try again later.');
                    break;
                case 404:
                    event.preventDefault();
                    $state.go('content.notFound', {}, {reset: true});
                    break;
                default:
                    AlertService.info(error.data);
            }
        });
    }]
);