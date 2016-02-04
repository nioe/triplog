(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = angular.module('alert', []);

module.exports.factory('AlertService', require('./alert.service'));
},{"./alert.service":2}],2:[function(require,module,exports){
'use strict';

// @ngInject
AlertService.$inject = ["$rootScope"];
function AlertService($rootScope) {
    function alert(type, msg) {
        $rootScope.alerts.push({
            type: type,
            msg: msg
        });
    }

    return {
        success: alert.bind(undefined, 'success'),
        info: alert.bind(undefined, 'info'),
        warning: alert.bind(undefined, 'warning'),
        error: alert.bind(undefined, 'danger')
    };
}

module.exports = AlertService;

},{}],3:[function(require,module,exports){
'use strict';

module.exports = angular.module('config', [])

.constant('REST_URL_PREFIX', 'http://localhost:8080/services')

.constant('MAP_BOX_ACCESS_TOKEN', 'pk.eyJ1IjoibmVvemVyb29uZSIsImEiOiI5YjRmODE4YzM2OGNhOTNhYmE5NjQwYTkwMzlhYzQ2NyJ9.RdoIup-zRJ-ve3e0cWwiKw')

.constant('MAP_BOX_STYLE', 'mapbox.streets')

.constant('ENV', 'local')

.constant('GOOGLE_ANALYTICS_TRACKING_CODE', 'UA-63099545-2')

;
},{}],4:[function(require,module,exports){
'use strict';

// @ngInject
ContentController.$inject = ["$rootScope", "$state", "$window", "ENV", "trips", "TripsService", "LoginService", "AlertService", "showModal"];
function ContentController($rootScope, $state, $window, ENV, trips, TripsService, LoginService, AlertService, showModal) {

    var vm = this;
    vm.environment = ENV;
    vm.trips = trips;

    vm.navigationIsShown = false;
    vm.isIosFullscreen = $window.navigator.standalone ? true : false;

    vm.openPicture = function (imageName) {
      $rootScope.$emit('triplogOpenPicture', imageName);
    };

    reCreateNavigation();

    // React on state changes
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', createStepOverviewNavBarEntry);
    $rootScope.$on('loginStateChanged', reCreateNavigation);

    vm.toggleNavigation = function () {
        if (vm.navigationIsShown) {
            vm.closeNavigation();
        } else {
            vm.openNavigation();
        }
    };

    vm.closeNavigation = function () {
        if (isDeviceWithSideNavigation() && vm.navigationIsShown) {
            vm.navigationIsShown = false;
        }
    };

    vm.openNavigation = function () {
        if (isDeviceWithSideNavigation() && !vm.navigationIsShown) {
            vm.navigationIsShown = true;
        }
    };

    vm.logout = function () {
        vm.closeNavigation();
        LoginService.logout().then(function () {
            $state.go('content.allTrips', {}, {reload: true});
            AlertService.success('You have been successfully logged out.');
        }, function () {
            AlertService.error('There was an error during the logout process... :( Please try again.');
        });
    };

    /************************************** Private Functions **************************************/
    function reCreateNavigation() {
        vm.navBarEntries = [];
        createTripOverviewNavBarEntry();
        createStepOverviewNavBarEntry();
    }

    function stateChangeStart() {
        vm.closeNavigation();
        removeStepOverviewNavBarEntry();
    }

    function createTripOverviewNavBarEntry() {
        var entries = [
            {
                id: 'overview',
                name: 'Overview',
                icon: 'trip-overview',
                action: function () {
                    $state.go('content.allTrips');
                },
                divider: true,
                active: function () {
                    return $state.current.name === 'content.allTrips';
                }
            }
        ];

        vm.trips.forEach(function (trip) {
            entries.push({
                id: trip.tripId,
                name: trip.displayName,
                icon: 'trip',
                action: function () {
                    $state.go('content.stepOverview', {tripId: trip.tripId});
                },
                active: function () {
                    return ['content.stepOverview', 'content.stepOfTrip'].indexOf($state.current.name) !== -1 &&
                        $state.params.tripId === trip.tripId;
                }
            });
        });

        if ($rootScope.loggedIn) {
            entries[entries.length - 1].divider = true;
            entries.push({
                id: 'addTrip',
                name: 'Add trip',
                icon: 'add',
                action: function () {
                    console.log('Not yet implemented... :(');
                },
                active: function () {
                    return false; //TODO Implement function
                }
            });
        }

        vm.navBarEntries.push({
            id: 'trips',
            name: 'Trips',
            icon: 'trip-overview',
            entries: entries
        });
    }


    function createStepOverviewNavBarEntry() {
        if (['content.stepOverview', 'content.stepOfTrip'].indexOf($state.current.name) !== -1) {
            var tripId = $state.params.tripId,
                entries = [
                    {
                        id: 'overview',
                        name: 'Overview',
                        icon: 'step-overview',
                        action: function () {
                            $state.go('content.stepOverview', {tripId: tripId, edit: undefined});
                        },
                        divider: true,
                        active: function () {
                            return $state.current.name === 'content.stepOverview' && !$state.params.edit;
                        }
                    }
                ],
                tripIndex = indexOfTripWithId(tripId);

            if (tripIndex >= 0) {
                vm.trips[tripIndex].steps.forEach(function (step) {
                    entries.push({
                        id: step.stepId,
                        name: step.stepName,
                        icon: 'step',
                        action: function () {
                            $state.go('content.stepOfTrip', {tripId: tripId, stepId: step.stepId});
                        },
                        active: function () {
                            return $state.params.tripId === tripId && $state.params.stepId === step.stepId;
                        }
                    });
                });

                if ($rootScope.loggedIn) {
                    entries[entries.length - 1].divider = true;
                    entries = entries.concat(tripControls(tripId));
                }

                vm.navBarEntries.push({
                    id: tripId,
                    name: vm.trips[tripIndex].displayName,
                    icon: 'trip',
                    entries: entries
                });
            }
        }
    }

    function removeStepOverviewNavBarEntry() {
        var tripId = $state.params.tripId;
        if (tripId) {
            var index = indexOfNavBarEntryWithId(tripId);
            if (index >= 0) {
                vm.navBarEntries.splice(index, 1);
            }
        }
    }

    function indexOfNavBarEntryWithId(id) {
        for (var i = 0; i < vm.navBarEntries.length; i++) {
            if (vm.navBarEntries[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    function indexOfTripWithId(tripId) {
        for (var i = 0; i < vm.trips.length; i++) {
            if (vm.trips[i].tripId === tripId) {
                return i;
            }
        }

        return -1;
    }

    function isDeviceWithSideNavigation() {
        return $window.innerWidth < 768;
    }

    function tripControls(tripId) {
        var controls = [];

        controls.push({
            id: 'editTrip',
            name: 'Edit Trip',
            icon: 'edit',
            action: function () {
                $state.go('content.stepOverview', {tripId: tripId, edit: true});
            },
            active: function () {
                return $state.current.name === 'content.stepOverview' && $state.params.edit;
            }
        });

        controls.push({
            id: 'deleteTrip',
            name: 'Delete Trip',
            icon: 'delete',
            action: function () {
                var trip = trips[indexOfTripWithId(tripId)],
                    deleteTripModalData = {
                        title: 'Delete ' + trip.tripName,
                        message: 'Caution: This cannot be undone. All trip data including all stpes and pictures will be deleted!',
                        okText: 'Delete',
                        okClass: 'btn-danger',
                        cancelText: 'Cancel',
                        cancelClass: 'btn-primary'
                    };

                showModal(deleteTripModalData).then(function () {
                    TripsService.deleteTrip(tripId).then(function() {
                        $state.go('content.allTrips', {}, {reload: true});
                        AlertService.success('Trip ' + trip.tripName + ' has been successfully deleted.');
                    }, function(error) {
                        console.error('Error while deleting trip with id ', tripId, error);
                        AlertService.error(error.data);
                    });
                });
            },
            active: function () {
                return false;
            }
        });

        controls.push({
            id: 'addStep',
            name: 'Add step',
            icon: 'add',
            action: function () {
                console.log('Not yet implemented... :(');
            },
            active: function () {
                return false; //TODO Implement function
            }
        });

        return controls;
    }
}

module.exports = ContentController;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = angular.module('content', [
    'hc.marked',
    'LocalStorageModule',
    require('modules/trip').name,
    require('modules/stepOverview').name,
    require('modules/stepDetail').name,
    require('modules/login').name,
    require('modules/config').name,
    require('modules/tripsResource').name,
    require('modules/loginResource').name,
    require('modules/alert').name,
    require('modules/modalMessage').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html').name
]);

module.exports.config(['markedProvider', 'REST_URL_PREFIX', function (markedProvider, REST_URL_PREFIX) {
    markedProvider.setRenderer({
        heading: function (text, level) {
            var subLevel = level + 1;
            return '<h' + subLevel + '>' + text + '</h' + subLevel + '>';
        },

        image: function (href, title, text) {
            href = href || '';
            var imageName;

            if (href.indexOf('http') !== 0) {
                href = REST_URL_PREFIX + '/' + href;
                imageName = href.substr(href.lastIndexOf('/') + 1);
            }

            var img = '<img src="' + href + '"';
            img += text ? ' alt="' + text + '"' : '';
            img += imageName ? ' onclick="angular.element(this).scope().content.openPicture(\'' + imageName + '\')"' : '';
            img += '>';

            return img;
        }
    });
}]);

module.exports.controller('ContentController', require('./content.controller'));

module.exports.constant('CONTENT_STORAGE_KEYS', {
    READ_STEPS: 'read-steps'
});
},{"./content.controller":4,"./content.tpl.html":6,"modules/alert":1,"modules/config":3,"modules/login":10,"modules/loginResource":37,"modules/modalMessage":34,"modules/stepDetail":15,"modules/stepOverview":19,"modules/trip":22,"modules/tripsResource":43}],6:[function(require,module,exports){
var ngModule = angular.module('content.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('content.tpl.html',
    '<div class="page content-page" ng-class="{ \'navigation-is-shown\': content.navigationIsShown }">\n' +
    '    <nav class="navbar navbar-default navbar-fixed-top" role="navigation" ng-class="{ \'ios-status-bar\': content.isIosFullscreen }">\n' +
    '        <div class="navbar-header">\n' +
    '            <button type="button" class="navbar-toggle" ng-class="{ \'active\': content.navigationIsShown }"\n' +
    '                    ng-click="content.toggleNavigation()">\n' +
    '                <span class="sr-only">Toggle navigation</span>\n' +
    '                <span class="icon-bar"></span>\n' +
    '                <span class="icon-bar"></span>\n' +
    '                <span class="icon-bar"></span>\n' +
    '            </button>\n' +
    '            <a class="navbar-brand" ui-sref="welcome">\n' +
    '                <span class="logo icon-triplog"></span>\n' +
    '                <span class="text">Bros.Pics</span>\n' +
    '            </a>\n' +
    '        </div>\n' +
    '\n' +
    '        <!-- Collect the nav links, forms, and other content for toggling -->\n' +
    '        <div class="navbar-collapse" ng-swipe-right="content.closeNavigation()">\n' +
    '            <ul class="nav navbar-nav">\n' +
    '                <!-- Normal Link -->\n' +
    '                <li ng-repeat-start="entry in content.navBarEntries"\n' +
    '                    ng-class="{ active: entry.active() }"\n' +
    '                    ng-if="!entry.entries">\n' +
    '\n' +
    '                    <a href ng-click="entry.action()"><span class="icon-{{ entry.icon }}"></span> {{ entry.name }}</a>\n' +
    '                </li>\n' +
    '\n' +
    '                <!-- Dropdown -->\n' +
    '                <li ng-class="{ active: entry.active() }"\n' +
    '                    class="dropdown"\n' +
    '                    uib-dropdown\n' +
    '                    on-toggle="toggled(open)"\n' +
    '                    ng-if="entry.entries"\n' +
    '                    ng-repeat-end>\n' +
    '\n' +
    '                    <a href class="dropdown-toggle" role="button" uib-dropdown-toggle>\n' +
    '                        <span class="icon-{{ entry.icon }}"></span>\n' +
    '                        {{ entry.name }}\n' +
    '                        <span class="icon-dropdown"></span>\n' +
    '                    </a>\n' +
    '\n' +
    '                    <ul class="dropdown-menu" role="menu">\n' +
    '                        <li ng-class="{ active: dropDownEntry.active() }" ng-repeat-start="(dropDownEntryId, dropDownEntry) in entry.entries">\n' +
    '                            <a href ng-click="dropDownEntry.action()"><span\n' +
    '                                    class="icon-{{ dropDownEntry.icon }}"></span> {{ dropDownEntry.name }}</a>\n' +
    '                        </li>\n' +
    '                        <li class="divider" ng-if="dropDownEntry.divider" ng-repeat-end></li>\n' +
    '                    </ul>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '\n' +
    '            <ul class="nav navbar-nav navbar-right">\n' +
    '                <li ng-if="!loggedIn">\n' +
    '                    <a ui-sref="content.login"><span class="icon-login"></span> Login</a>\n' +
    '                </li>\n' +
    '                <li ng-if="loggedIn">\n' +
    '                    <a href ng-click="content.logout()"><span class="icon-login"></span> Logout</a>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '        </div>\n' +
    '    </nav>\n' +
    '\n' +
    '    <main class="content-container" ng-class="{ \'ios-status-bar-present\': content.isIosFullscreen }">\n' +
    '        <div class="container-fluid"\n' +
    '             ng-swipe-left="content.openNavigation()"\n' +
    '             ng-swipe-right="content.closeNavigation()"\n' +
    '             ng-swipe-disable-mouse>\n' +
    '\n' +
    '            <div class="row">\n' +
    '                <div class="col-xs-12 col-lg-8 col-lg-offset-2 ui-view-container">\n' +
    '                    <div class="content" ui-view></div>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </main>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],7:[function(require,module,exports){
'use strict';

module.exports = angular.module('error', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./notFound.tpl.html').name
]);
},{"./notFound.tpl.html":8}],8:[function(require,module,exports){
var ngModule = angular.module('notFound.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('notFound.tpl.html',
    '<h1 class="line">Not found</h1>\n' +
    '\n' +
    '<p>We could not find what you where looking for...</p>');
}]);

module.exports = ngModule;
},{}],9:[function(require,module,exports){
'use strict';

// @ngInject
LoginController.$inject = ["LoginService", "AlertService", "$state"];
function LoginController(LoginService, AlertService, $state) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            var referrer = $state.params.referrerState;
            if (referrer.state.name) {
                $state.go(referrer.state.name, referrer.params, {reload: true});
            } else {
                $state.go('content.allTrips', undefined, {reload: true});
            }

            AlertService.success('Successfully logged in as user ' + vm.username + '.');
        }, function (response) {
            switch (response.status) {
                case 401:
                    vm.loginError = true;
                    AlertService.error('Invalid username or password.');
                    break;

                case 'offline':
                    AlertService.info(response.data);
                    break;

                default:
                    AlertService.error('An unknown error occurred during the login process. Please try again.');
            }
        });
    };
}

module.exports = LoginController;

},{}],10:[function(require,module,exports){
'use strict';

module.exports = angular.module('login', [
    'ui.router',
    require('modules/loginResource').name,
    require('modules/alert').name,
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./login.tpl.html').name
]);

module.exports.controller('LoginController', require('./login.controller'));
},{"./login.controller":9,"./login.tpl.html":11,"modules/alert":1,"modules/config":3,"modules/loginResource":37}],11:[function(require,module,exports){
var ngModule = angular.module('login.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('login.tpl.html',
    '<h1 class="line">Login</h1>\n' +
    '\n' +
    '<div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-4 col-md-offset-4">\n' +
    '    <form class="form-horizontal">\n' +
    '        <div class="form-group" ng-class="{\'has-error\': login.loginError}">\n' +
    '            <div class="input-group">\n' +
    '                <div class="input-group-addon icon-user"></div>\n' +
    '                <input type="text" class="form-control input-lg" placeholder="Username" ng-model="login.username">\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        <div class="form-group" ng-class="{\'has-error\': login.loginError}">\n' +
    '            <div class="input-group">\n' +
    '                <div class="input-group-addon icon-password"></div>\n' +
    '                <input type="password" class="form-control input-lg" placeholder="Password" ng-model="login.password">\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        <div class="form-group text-center">\n' +
    '            <button class="btn btn-default btn-lg" ng-click="login.login()" ng-disabled="!(login.username && login.password)">\n' +
    '                <span class="icon-login"></span> Login\n' +
    '            </button>\n' +
    '        </div>\n' +
    '    </form>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],12:[function(require,module,exports){
'use strict';

// @ngInject
function DateLine() {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'dateLine.tpl.html',
        scope: {
            fromDate: '@',
            toDate: '@'
        }
    };
}

module.exports = DateLine;

},{}],13:[function(require,module,exports){
var ngModule = angular.module('dateLine.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('dateLine.tpl.html',
    '<div class="dateLine">\n' +
    '    <span ng-if="fromDate !== toDate">\n' +
    '        <span class="avoid-wrap">{{ fromDate | date:\'fullDate\'}} &ndash;</span>\n' +
    '        <span class="avoid-wrap">{{ toDate | date:\'fullDate\'}}</span>\n' +
    '    </span>\n' +
    '    <span ng-if="fromDate === toDate">{{ fromDate | date:\'fullDate\'}}</span>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],14:[function(require,module,exports){
'use strict';

// @ngInject
StepDetailController.$inject = ["$rootScope", "$state", "step", "CONTENT_STORAGE_KEYS", "localStorageService"];
function StepDetailController($rootScope, $state, step, CONTENT_STORAGE_KEYS, localStorageService) {
    var vm = this;
    vm.step = step;
    vm.galleryPictures = step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    markStepAsRead();

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    function markStepAsRead() {
        var readSteps = localStorageService.get(CONTENT_STORAGE_KEYS.READ_STEPS) || [];
        if (readSteps.indexOf(step.fullQualifiedStepId) === -1) {
            readSteps.push(step.fullQualifiedStepId);
            localStorageService.set(CONTENT_STORAGE_KEYS.READ_STEPS, readSteps);
        }
    }
}

module.exports = StepDetailController;

},{}],15:[function(require,module,exports){
'use strict';

module.exports = angular.module('stepDetail', [
    require('modules/triplogGallery').name,
    require('modules/triplogMap').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepDetail.tpl.html').name,
    require('./dateLine.tpl.html').name
]);

module.exports.controller('StepDetailController', require('./stepDetail.controller'));
module.exports.directive('dateLine', require('./dateLine.directive'));
},{"./dateLine.directive":12,"./dateLine.tpl.html":13,"./stepDetail.controller":14,"./stepDetail.tpl.html":16,"modules/triplogGallery":48,"modules/triplogMap":51}],16:[function(require,module,exports){
var ngModule = angular.module('stepDetail.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('stepDetail.tpl.html',
    '<header>\n' +
    '    <h1 class="line">{{ stepDetail.step.stepName }}</h1>\n' +
    '\n' +
    '    <date-line from-date="{{ stepDetail.step.fromDate }}" to-date="{{ stepDetail.step.toDate }}"></date-line>\n' +
    '</header>\n' +
    '\n' +
    '<article class="columns">\n' +
    '    <div class="triplog-lead">\n' +
    '        {{ stepDetail.step.stepLead }}\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="triplog-text" marked="stepDetail.step.stepText"></div>\n' +
    '</article>\n' +
    '\n' +
    '<triplog-map gps-points="stepDetail.step.gpsPoints" pictures="stepDetail.galleryPictures" ng-if="stepDetail.showMap()"></triplog-map>\n' +
    '\n' +
    '<triplog-gallery ng-if="stepDetail.galleryPictures && stepDetail.galleryPictures.length > 0" pictures="stepDetail.galleryPictures"></triplog-gallery>\n' +
    '\n' +
    '<aside class="previousNextStep">\n' +
    '    <div class="prev" ng-if="stepDetail.step.previousStep">\n' +
    '        <div class="link-holder"\n' +
    '             ui-sref="content.stepOfTrip({tripId: \'{{ stepDetail.step.tripId }}\', stepId: \'{{ stepDetail.step.previousStep.stepId }}\'})">\n' +
    '            <div>\n' +
    '                <i class="icon-prev"></i>\n' +
    '            </div>\n' +
    '            <div class="text"> {{ stepDetail.step.previousStep.stepName }}</div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="prev-placeholder" ng-if="!stepDetail.step.previousStep"></div>\n' +
    '    <div class="next" ng-if="stepDetail.step.nextStep">\n' +
    '        <div class="link-holder"\n' +
    '             ui-sref="content.stepOfTrip({tripId: \'{{ stepDetail.step.tripId }}\', stepId: \'{{ stepDetail.step.nextStep.stepId }}\'})">\n' +
    '            <div class="text">{{ stepDetail.step.nextStep.stepName }}</div>\n' +
    '            <div>\n' +
    '                <i class="icon-next"></i>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</aside>');
}]);

module.exports = ngModule;
},{}],17:[function(require,module,exports){
'use strict';

// @ngInject
StepOverviewController.$inject = ["$rootScope", "$state", "trip", "showModal", "TripsService", "AlertService", "CONTENT_STORAGE_KEYS", "localStorageService"];
function StepOverviewController($rootScope, $state, trip, showModal, TripsService, AlertService, CONTENT_STORAGE_KEYS, localStorageService) {
    var vm = this;
    vm.trip = trip;
    vm.editableTrip = createEditableTrip();

    vm.editMode = $state.params.edit && $rootScope.loggedIn;

    $state.current.data.pageTitle = vm.trip.displayName;

    vm.templateToShow = function () {
        return vm.editMode ? 'stepOverview.edit.tpl.html' : 'stepOverview.view.tpl.html';
    };

    vm.reset = function () {
        vm.editableTrip = createEditableTrip();
    };

    vm.cancelEdit = function () {
        showModal({
            title: 'Cancel editing?',
            message: 'All your changed data will be lost.',
            okText: 'Cancel anyway',
            okClass: 'btn-danger',
            cancelText: 'Continue editing',
            cancelClass: 'btn-primary'
        }).then(function () {
            $state.go('content.stepOverview', {edit: undefined});
        });
    };

    vm.saveTrip = function () {
        TripsService.updateTrip(vm.editableTrip).then(function () {
            AlertService.success('Trip has been updated.');
            $state.go('content.stepOverview', {edit: undefined}, {reload: true});
        });
    };

    vm.isUnread = function (step){
        var readSteps = localStorageService.get(CONTENT_STORAGE_KEYS.READ_STEPS) || [];
        return readSteps.indexOf(trip.tripId + '/' + step.stepId) === -1;
    };

    function createEditableTrip() {
        var editableTrip = angular.copy(trip);
        editableTrip.tripDate = new Date(trip.tripDate);
        editableTrip.published = trip.published ? new Date(trip.published) : undefined;

        return editableTrip;
    }
}

module.exports = StepOverviewController;

},{}],18:[function(require,module,exports){
var ngModule = angular.module('stepOverview.edit.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('stepOverview.edit.tpl.html',
    '<form class="form-horizontal">\n' +
    '    <!-- Trip Name -->\n' +
    '    <div class="form-group">\n' +
    '        <label for="trip-name" class="col-xs-12 col-sm-2 control-label">Name</label>\n' +
    '        <div class="col-xs-12 col-sm-10">\n' +
    '            <input type="text" class="form-control" id="trip-name" placeholder="Trip Name" ng-model="stepOverview.editableTrip.tripName">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <!-- Trip Date -->\n' +
    '    <div class="form-group">\n' +
    '        <label for="trip-date" class="col-xs-12 col-sm-2 control-label">Date</label>\n' +
    '        <div class="col-xs-12 col-sm-10">\n' +
    '            <input type="date" class="form-control" id="trip-date" placeholder="Trip Name" ng-model="stepOverview.editableTrip.tripDate">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <!-- Trip Lead -->\n' +
    '    <div class="form-group">\n' +
    '        <label for="trip-lead" class="col-xs-12 col-sm-2 control-label">Lead</label>\n' +
    '        <div class="col-xs-12 col-sm-10">\n' +
    '            <textarea class="form-control" id="trip-lead" rows="5" ng-model="stepOverview.editableTrip.tripLead"></textarea>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <!-- Trip Text -->\n' +
    '    <markdown-preview model="stepOverview.editableTrip.tripText"></markdown-preview>\n' +
    '\n' +
    '    <!-- Cover Picture -->\n' +
    '    <div class="form-group">\n' +
    '        <label for="cover-picture" class="col-xs-12 col-sm-2 control-label">Cover Picture</label>\n' +
    '        <div class="col-xs-12 col-sm-10">\n' +
    '            <input type="text" class="form-control" id="cover-picture" placeholder="http://url.to/cover/picture.jpg" ng-model="stepOverview.editableTrip.coverPicture">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <!-- Publish Date -->\n' +
    '    <div class="form-group">\n' +
    '        <label for="publish-date" class="col-xs-12 col-sm-2 control-label">Publish Date</label>\n' +
    '        <div class="col-xs-12 col-sm-10">\n' +
    '            <input type="datetime-local" class="form-control" id="publish-date" ng-model="stepOverview.editableTrip.published">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <!-- Buttons -->\n' +
    '    <div class="form-group">\n' +
    '        <div class="col-xs-4 col-sm-offset-2 col-sm-3 btn-col">\n' +
    '            <button ng-click="stepOverview.reset()" class="btn-reset">Reset</button>\n' +
    '        </div>\n' +
    '        <div class="col-xs-8 col-sm-7 btn-col right">\n' +
    '            <button ng-click="stepOverview.cancelEdit()" class="btn-cancel">Cancel</button>\n' +
    '            <button ng-click="stepOverview.saveTrip()" class="btn-ok">Save</button>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</form>');
}]);

module.exports = ngModule;
},{}],19:[function(require,module,exports){
'use strict';

module.exports = angular.module('stepOverview', [
    require('modules/triplogTimeline').name,
    require('modules/modalMessage').name,
    require('modules/markdownPreview').name,
    require('modules/tripsResource').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepOverview.tpl.html').name,
    require('./stepOverview.view.tpl.html').name,
    require('./stepOverview.edit.tpl.html').name
]);

module.exports.controller('StepOverviewController', require('./stepOverview.controller'));
},{"./stepOverview.controller":17,"./stepOverview.edit.tpl.html":18,"./stepOverview.tpl.html":20,"./stepOverview.view.tpl.html":21,"modules/markdownPreview":30,"modules/modalMessage":34,"modules/triplogTimeline":59,"modules/tripsResource":43}],20:[function(require,module,exports){
var ngModule = angular.module('stepOverview.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('stepOverview.tpl.html',
    '<h1 class="line">{{ stepOverview.trip.displayName }}</h1>\n' +
    '\n' +
    '<ng-include src="stepOverview.templateToShow()"></ng-include>');
}]);

module.exports = ngModule;
},{}],21:[function(require,module,exports){
var ngModule = angular.module('stepOverview.view.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('stepOverview.view.tpl.html',
    '<article class="columns">\n' +
    '    <div class="triplog-lead">{{ stepOverview.trip.tripLead }}</div>\n' +
    '    <div class="triplog-text" marked="stepOverview.trip.tripText"></div>\n' +
    '</article>\n' +
    '\n' +
    '<triplog-timeline ng-if="stepOverview.trip.steps && stepOverview.trip.steps.length > 0">\n' +
    '    <triplog-timeline-moment\n' +
    '            ng-repeat="step in stepOverview.trip.steps"\n' +
    '            moment-title="{{ step.stepName }}"\n' +
    '            picture="{{ step.coverPicture }}"\n' +
    '            from-date="{{ step.fromDate }}"\n' +
    '            to-date="{{ step.toDate }}"\n' +
    '            unread-flag="stepOverview.isUnread(step)"\n' +
    '            moment-sref="content.stepOfTrip({tripId: \'{{ stepOverview.trip.tripId }}\', stepId: \'{{ step.stepId }}\'})">\n' +
    '        {{ step.stepLead }}\n' +
    '    </triplog-timeline-moment>\n' +
    '</triplog-timeline>');
}]);

module.exports = ngModule;
},{}],22:[function(require,module,exports){
'use strict';

module.exports = angular.module('trip', [
    'ui.router',
    require('modules/triplogTile').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./tripOverview.tpl.html').name
]);
},{"./tripOverview.tpl.html":23,"modules/triplogTile":54}],23:[function(require,module,exports){
var ngModule = angular.module('tripOverview.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('tripOverview.tpl.html',
    '<h1 class="line">Trip Overview</h1>\n' +
    '\n' +
    '<p>On this page you can see an overview over all trips we already did or are planning to do.</p>\n' +
    '\n' +
    '<triplog-tile-box>\n' +
    '    <triplog-tile ng-repeat="trip in content.trips"\n' +
    '                  tile-title="{{ trip.displayName }}"\n' +
    '                  picture="{{ trip.coverPicture }}"\n' +
    '                  ui-sref="content.stepOverview({tripId: \'{{ trip.tripId }}\'})">\n' +
    '        {{ trip.tripLead }}\n' +
    '    </triplog-tile>\n' +
    '</triplog-tile-box>');
}]);

module.exports = ngModule;
},{}],24:[function(require,module,exports){
'use strict';

// @ngInject
LoadingSpinnerController.$inject = ["$http"];
function LoadingSpinnerController($http) {

    var vm = this;

    vm.isShown = function () {
        return $http.pendingRequests.length !== 0;
    };
}

module.exports = LoadingSpinnerController;

},{}],25:[function(require,module,exports){
'use strict';

// @ngInject
function LoadingSpinnerDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'loadingSpinner.tpl.html',
        controller: require('./loadingSpinner.controller'),
        controllerAs: 'loadingSpinner',
        bindToController: true
    };
}

module.exports = LoadingSpinnerDirective;

},{"./loadingSpinner.controller":24}],26:[function(require,module,exports){
'use strict';

module.exports = angular.module('loadingSpinner', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./loadingSpinner.tpl.html').name
]);

module.exports.directive('loadingSpinner', require('./loadingSpinner.directive'));
},{"./loadingSpinner.directive":25,"./loadingSpinner.tpl.html":27}],27:[function(require,module,exports){
var ngModule = angular.module('loadingSpinner.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('loadingSpinner.tpl.html',
    '<aside class="loadingSpinner" ng-if="loadingSpinner.isShown()">\n' +
    '    <div class="centered">\n' +
    '        <div class="spinner">\n' +
    '            <div class="bounce1"></div>\n' +
    '            <div class="bounce2"></div>\n' +
    '            <div class="bounce3"></div>\n' +
    '        </div>\n' +
    '\n' +
    '        <div class="text">\n' +
    '            loading\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</aside>');
}]);

module.exports = ngModule;
},{}],28:[function(require,module,exports){
'use strict';

// @ngInject
function MarkdownPreviewController() {
    var vm = this;

    vm.preview = false;

    vm.toggle = function () {
        vm.preview = !vm.preview;
    };
}

module.exports = MarkdownPreviewController;

},{}],29:[function(require,module,exports){
'use strict';

// @ngInject
function MarkdownPreviewDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'markdownPreview.tpl.html',
        controller: require('./markdownPreview.controller.js'),
        controllerAs: 'preview',
        bindToController: true,
        scope: {
            model: '='
        }
    };
}

module.exports = MarkdownPreviewDirective;

},{"./markdownPreview.controller.js":28}],30:[function(require,module,exports){
'use strict';

module.exports = angular.module('markdownPreview', [
    'hc.marked',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./markdownPreview.tpl.html').name
]);

module.exports.directive('markdownPreview', require('./markdownPreview.directive'));
},{"./markdownPreview.directive":29,"./markdownPreview.tpl.html":31}],31:[function(require,module,exports){
var ngModule = angular.module('markdownPreview.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('markdownPreview.tpl.html',
    '<div class="triplog-markdown-preview">\n' +
    '    <div class="form-group">\n' +
    '        <label for="trip-text" class="col-xs-12 col-sm-2 control-label">Text</label>\n' +
    '        <div class="col-xs-12 col-sm-10" ng-show="!preview.preview">\n' +
    '            <textarea class="form-control" id="trip-text" rows="10" ng-model="preview.model"></textarea>\n' +
    '        </div>\n' +
    '        <div class="col-xs-12 col-sm-10" ng-show="preview.preview">\n' +
    '            <div class="preview" marked="preview.model"></div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="form-group">\n' +
    '        <div class="col-xs-12 col-sm-offset-2 col-sm-10">\n' +
    '            <button class="btn btn-default" ng-click="preview.toggle()">{{ preview.preview ? \'Edit\' : \'Preview\' }}</button>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],32:[function(require,module,exports){
var ngModule = angular.module('modal.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('modal.tpl.html',
    '<div class="triplog-modal-header">\n' +
    '    <h3>{{ modalInstance.modalData.title }}</h3>\n' +
    '</div>\n' +
    '<div class="triplog-modal-body">\n' +
    '    <p>{{ modalInstance.modalData.message }}</p>\n' +
    '</div>\n' +
    '<div class="triplog-modal-footer">\n' +
    '    <button type="button" class="btn {{ modalInstance.modalData.cancelClass }}" data-ng-click="modalInstance.cancel()">\n' +
    '        {{ modalInstance.modalData.cancelText }}\n' +
    '    </button>\n' +
    '    <button ng-if="modalInstance.modalData.okText" class="btn {{ modalInstance.modalData.okClass }}" data-ng-click="modalInstance.ok()">\n' +
    '        {{ modalInstance.modalData.okText }}\n' +
    '    </button>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],33:[function(require,module,exports){
'use strict';

ModalInstanceController.$inject = ["$uibModalInstance", "modalData"];
module.exports = ModalInstanceController;

// @ngInject
function ModalInstanceController($uibModalInstance, modalData) {
    var vm = this;

    vm.modalData = modalData;

    vm.ok = function (result) {
        $uibModalInstance.close(result);
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

},{}],34:[function(require,module,exports){
'use strict';

module.exports = angular.module('modalMessage', [
    'ui.bootstrap',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./modal.tpl.html').name
]);

module.exports.factory('showModal', require('./showModal.fn'));
},{"./modal.tpl.html":32,"./showModal.fn":35}],35:[function(require,module,exports){
'use strict';

ShowModal.$inject = ["$uibModal"];
module.exports = ShowModal;

// @ngInject
function ShowModal($uibModal) {
    return function (modalData) {
        var defaultModalData = {
            title: 'Continue?',
            message: 'Do you want to continue?',
            okText: 'Yes',
            okClass: 'btn-primary',
            cancelText: 'No',
            cancelClass: 'btn-danger'
        };

        if (!modalData) {
            modalData = defaultModalData;
        }

        return $uibModal.open({
            backdrop: 'static',
            templateUrl: require('./modal.tpl.html').name,
            controller: require('./modalInstance.controller'),
            controllerAs: 'modalInstance',
            resolve: {
                modalData: {
                    title: modalData.title || defaultModalData.title,
                    message: modalData.message || defaultModalData.message,
                    okText: modalData.okText || defaultModalData.okText,
                    okClass: modalData.okClass || defaultModalData.okClass,
                    cancelText: modalData.cancelText || defaultModalData.cancelText,
                    cancelClass: modalData.cancelClass || defaultModalData.cancelClass
                }
            }
        }).result;
    };
}

},{"./modal.tpl.html":32,"./modalInstance.controller":33}],36:[function(require,module,exports){
'use strict';

// @ngInject
LoginService.$inject = ["$rootScope", "$q", "$http", "$cacheFactory", "localStorageService", "REST_URL_PREFIX", "LOGIN_STORAGE_KEYS", "ENV"];
function LoginService($rootScope, $q, $http, $cacheFactory, localStorageService, REST_URL_PREFIX, LOGIN_STORAGE_KEYS, ENV) {

    function login(username, password) {
        if ($rootScope.isOnline || ENV === 'local') {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE, username);
                localStorageService.set(LOGIN_STORAGE_KEYS.AUTH_TOKEN, response.data.id);

                setLoggedInStatus(response.data.id);

                return response;
            });
        } else {
            return checkLocalStorageIfUserHasBeenLoggedInBefore();
        }
    }

    function logout() {
        return $http({
            method: 'POST',
            url: REST_URL_PREFIX + '/logout'
        }).then(resetLoggedInStatus, function(error) {
            if (error.status === 401) {
                resetLoggedInStatus();
            } else {
                $q.reject(error);
            }
        });
    }

    function checkPresentToken() {
        var xAuthToken = localStorageService.get(LOGIN_STORAGE_KEYS.AUTH_TOKEN);
        if (xAuthToken) {
            return $http({
                method: 'POST',
                url: REST_URL_PREFIX + '/tokenValidator',
                headers: {
                    'X-AUTH-TOKEN': xAuthToken
                }
            }).then(setLoggedInStatus.bind(undefined, xAuthToken), resetLoggedInStatus);
        } else {
            return $q.resolve().then(resetLoggedInStatus);
        }
    }

    function callLoginService(username, password) {
        var auth = btoa(username + ':' + password);

        return $http({
            method: 'POST',
            url: REST_URL_PREFIX + '/login',
            headers: {
                'Authorization': 'Basic ' + auth
            }
        });
    }

    function checkLocalStorageIfUserHasBeenLoggedInBefore(username) {
        return $q(function (resolve, reject) {
            if (localStorageService.get(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE) === username) {
                resolve({
                    id: 'localToken'
                });
            } else {
                reject({
                    status: 'offline',
                    data: 'You seem to be offline and can therefore not login'
                });
            }
        });
    }

    function setLoggedInStatus(xAuthToken) {
        var originalLoginStatus = $rootScope.loggedIn;

        $http.defaults.headers.common['X-AUTH-TOKEN'] = xAuthToken;
        $rootScope.loggedIn = true;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function resetLoggedInStatus() {
        var originalLoginStatus = $rootScope.loggedIn;

        localStorageService.remove(LOGIN_STORAGE_KEYS.AUTH_TOKEN);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function reactOnLoggedInStatusChange(originalLoginStatus) {
        if (originalLoginStatus !== $rootScope.loggedIn) {
            $cacheFactory.get('$http').removeAll();

            $rootScope.$broadcast('loginStateChanged', {
                loggedIn: $rootScope.loggedIn
            });
        }
    }

    return {
        login: login,
        logout: logout,
        checkPresentToken: checkPresentToken
    };
}

module.exports = LoginService;

},{}],37:[function(require,module,exports){
'use strict';

module.exports = angular.module('loginResource', [
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('LoginService', require('./login.service'));

module.exports.constant('LOGIN_STORAGE_KEYS', {
    AUTH_TOKEN: 'xAuthToken',
    LOGGED_IN_BEFORE: 'loggedInBefore'
});
},{"./login.service":36,"modules/config":3}],38:[function(require,module,exports){
'use strict';

// @ngInject
StepsResource.$inject = ["$resource", "REST_URL_PREFIX"];
function StepsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId/steps/:stepId', {
        tripId: '@tripId',
        stepId: '@stepId'
    }, {
        get: {method: 'GET', cache: true},
        query: {method: 'GET', isArray: true, cache: true},
        update: {method: 'PUT'}
    });
}

module.exports = StepsResource;

},{}],39:[function(require,module,exports){
'use strict';

// @ngInject
TripsService.$inject = ["$rootScope", "$q", "StepsResource", "localStorageService", "STEP_STORAGE_KEYS", "ENV"];
function TripsService($rootScope, $q, StepsResource, localStorageService, STEP_STORAGE_KEYS, ENV) {

    function getStepOfTrip(tripId, stepId) {
        if ($rootScope.isOnline || ENV === 'local') {
            return StepsResource.get({tripId: tripId, stepId: stepId}).$promise.then(function (stepData) {
                stepData.fullQualifiedStepId = stepData.tripId + '/' + stepData.stepId;
                saveStepInLocalStorage(stepData);

                return stepData;
            }, function (error) {
                var step = readStepFromLocalStorage(tripId, stepId);
                if (step) {
                    return step;
                }

                return $q.reject({
                    status: error.status,
                    data: 'Step could not be fetched from server and is not cached locally.'
                });
            });
        } else {
            return $q(function (resolve, reject) {
                var step = readStepFromLocalStorage(tripId, stepId);
                if (step) {
                    resolve(step);
                } else {
                    reject({
                        status: 'offline',
                        data: 'You seem to be offline and step you want to visit is not yet stored locally... :('
                    });
                }
            });
        }
    }

    function saveStepInLocalStorage(stepData) {
        var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS) || {};

        if (!allStoredSteps[stepData.tripId]) {
            allStoredSteps[stepData.tripId] = {};
        }

        allStoredSteps[stepData.tripId][stepData.stepId] = stepData;

        localStorageService.set(STEP_STORAGE_KEYS.ALL_STEPS, allStoredSteps);
    }

    function readStepFromLocalStorage(tripId, stepId) {
        var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS);
        return allStoredSteps && allStoredSteps[tripId] && allStoredSteps[tripId][stepId] ? allStoredSteps[tripId][stepId] : undefined;
    }

    return {
        getStepOfTrip: getStepOfTrip
    };
}

module.exports = TripsService;

},{}],40:[function(require,module,exports){
'use strict';

module.exports = angular.module('stepsResource', [
    'ngResource',
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('StepsService', require('./steps.service'));
module.exports.factory('StepsResource', require('./steps.resource'));

module.exports.constant('STEP_STORAGE_KEYS', {
    ALL_STEPS: 'all-steps'
});
},{"./steps.resource":38,"./steps.service":39,"modules/config":3}],41:[function(require,module,exports){
'use strict';

// @ngInject
TripsResource.$inject = ["$resource", "REST_URL_PREFIX"];
function TripsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId', {
        tripId: '@id'
    }, {
        get: {method: 'GET', cache: true},
        query: {method: 'GET', isArray: true, cache: true},
        update: {method: 'PUT'}
    });
}

module.exports = TripsResource;

},{}],42:[function(require,module,exports){
'use strict';

// @ngInject
TripsService.$inject = ["$rootScope", "$q", "$filter", "$cacheFactory", "TripsResource", "localStorageService", "TRIP_STORAGE_KEYS"];
function TripsService($rootScope, $q, $filter, $cacheFactory, TripsResource, localStorageService, TRIP_STORAGE_KEYS) {

    return {
        getTrips: getTrips,
        getTrip: getTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip
    };

    function getTrips() {
        if ($rootScope.isOnline) {
            return TripsResource.query().$promise.then(function (tripData) {
                sortByPropertyDescending(tripData, 'tripDate');

                tripData.forEach(function (trip) {
                    trip.displayName = trip.tripName + ' ' + $filter('date')(trip.tripDate, 'yyyy');
                    sortByPropertyDescending(trip.steps, 'fromDate');
                });

                localStorageService.set($rootScope.loggedIn ? TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN : TRIP_STORAGE_KEYS.ALL_TRIPS, tripData);

                return tripData;
            }, function (error) {
                var storedTrips = getTripsFromLocalStorage();
                if (storedTrips) {
                    return storedTrips;
                }

                return $q.reject({
                    status: error.status,
                    data: 'Trips could not be fetched from server and there are no locally cached trips.'
                });
            });
        } else {
            return $q(function (resolve, reject) {
                var storedTrips = getTripsFromLocalStorage();
                if (storedTrips) {
                    resolve(storedTrips);
                } else {
                    reject({
                        status: 'offline',
                        data: 'You seem to be offline and there are no stored trips to show... :('
                    });
                }
            });
        }
    }

    function getTrip(tripId) {
        return getTrips().then(function (allTrips) {
            var trip = getTripWithId(tripId, allTrips);

            return trip ? trip : $q.reject({
                status: 404,
                data: 'Trip with ID ' + tripId + ' could not be found.'
            });
        });
    }

    function updateTrip(trip) {
        if ($rootScope.isOnline) {
            return TripsResource.update({tripId: trip.tripId}, trip).$promise.then(
                function (response) {
                    return response;
                },
                function (error) {
                    var msg = 'Trip ' + trip.tripName + ' could not be updated.';

                    if (error.data) {
                        msg += '\nError Message: "' + error.data + '"';
                    }

                    $q.reject({
                        status: error.status,
                        data: msg
                    });
                }
            );
        } else {
            updateTripInLocalStorage(trip);
            return saveTripToBeUpdated(trip, {
                status: 'offline',
                data: 'You seem to be offline. Therefore the trip ' + trip.tripName + ' could only be updated locally. It will be updated on the server as soon as you have an internet connection'
            });
        }
    }

    function deleteTrip(tripId) {
        if ($rootScope.isOnline) {
            return TripsResource.delete({tripId: tripId}).$promise.then(deleteTripFromLocalStorage.bind(undefined, tripId), function (error) {
                if (error && error.status === 404) {
                    return $q.reject({
                        status: 404,
                        data: 'Trip with ID ' + tripId + ' could not be found.'
                    });
                }

                return saveTripToBeDeleted(tripId, {
                    status: 0,
                    data: 'Trip with ID ' + tripId + ' could not be deleted at the moment. However it is marked to be deleted in the future.'
                });
            });
        } else {
            return saveTripToBeDeleted(tripId, {
                status: 'offline',
                data: 'You seem to be offline. Therefore the trip with the ID ' + tripId + ' could only be deleted locally. It will be deleted on the server as soon as you have an internet connection'
            });
        }
    }


    /******************************** Private functions ********************************/

    function sortByPropertyDescending(arr, property) {
        arr.sort(function (a, b) {
            if (a[property] > b[property]) {
                return -1;
            }

            if (a[property] < b[property]) {
                return 1;
            }

            return 0;
        });
    }

    function getTripsFromLocalStorage() {
        var storedTrips;
        if ($rootScope.loggedIn) {
            storedTrips = localStorageService.get(TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN);
        }

        if (!storedTrips || storedTrips.length === 0) {
            storedTrips = localStorageService.get(TRIP_STORAGE_KEYS.ALL_TRIPS);
        }

        return storedTrips && storedTrips.length > 0 ? storedTrips : undefined;
    }

    function getTripWithId(tripId, allTrips) {
        var tripsWithGivenId = allTrips.filter(function (trip) {
            return trip.tripId === tripId;
        });

        return tripsWithGivenId.length > 0 ? tripsWithGivenId[0] : undefined;
    }

    function updateTripInLocalStorage(trip) {
        deleteTripFromLocalStorage(trip.tripId);

        function addTripToLocalStorageWithKey(trip, localStorageKey) {
            var storedTrips = localStorageService.get(localStorageKey);
            if (!storedTrips) {
                storedTrips = [];
            }

            storedTrips.push(trip);
            localStorageService.set(localStorageKey, storedTrips);
        }

        addTripToLocalStorageWithKey(trip, TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN);

        clearCache();
    }

    function deleteTripFromLocalStorage(tripId) {
        function deleteTripFromLocalStorageWithKey(tripId, localStorageKey) {
            var storedTrips = localStorageService.get(localStorageKey);

            if (storedTrips) {
                localStorageService.set(localStorageKey, storedTrips.filter(function (trip) {
                    return trip.tripId !== tripId;
                }));
            }
        }

        deleteTripFromLocalStorageWithKey(tripId, TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN);

        clearCache();
    }

    function saveTripToBeUpdated(trip, info) {
        var tripsToUpdate = localStorageService.get(TRIP_STORAGE_KEYS.TRIPS_TO_UPDATE);

        if (!tripsToUpdate) {
            tripsToUpdate = [];
        }

        tripsToUpdate.push(trip);
        localStorageService.set(TRIP_STORAGE_KEYS.TRIPS_TO_UPDATE, tripsToUpdate);

        return $q.resolve(info);
    }

    function saveTripToBeDeleted(tripId, info) {
        var tripsToDelete = localStorageService.get(TRIP_STORAGE_KEYS.TRIPS_TO_DELETE);

        if (!tripsToDelete) {
            tripsToDelete = [];
        }

        tripsToDelete.push(tripId);
        localStorageService.set(TRIP_STORAGE_KEYS.TRIPS_TO_DELETE, tripsToDelete);

        return $q.resolve(info);
    }

    function clearCache() {
        $cacheFactory.get('$http').removeAll();
    }
}

module.exports = TripsService;

},{}],43:[function(require,module,exports){
'use strict';

module.exports = angular.module('tripsResource', [
    'ngResource',
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('TripsService', require('./trips.service'));
module.exports.factory('TripsResource', require('./trips.resource'));

module.exports.constant('TRIP_STORAGE_KEYS', {
    ALL_TRIPS: 'all-trips',
    ALL_TRIPS_ADMIN: 'all-trips-admin',
    TRIPS_TO_UPDATE: 'trips-to-update',
    TRIPS_TO_DELETE: 'trips-to-delete'
});
},{"./trips.resource":41,"./trips.service":42,"modules/config":3}],44:[function(require,module,exports){
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

triplogApp.config(["$stateProvider", "$urlRouterProvider", "AnalyticsProvider", "GOOGLE_ANALYTICS_TRACKING_CODE", function ($stateProvider, $urlRouterProvider, AnalyticsProvider, GOOGLE_ANALYTICS_TRACKING_CODE) {

    $urlRouterProvider.when('', ["$injector", function ($injector) {
        var localStorageService = $injector.get('localStorageService'),
            $state = $injector.get('$state'),
            lastState = localStorageService.get('lastState');

        if (lastState) {
            $state.go(lastState.state.name, lastState.params);
        } else {
            $state.go('welcome');
        }
    }]);

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
                checkLoginBefore: ["LoginService", function(LoginService) {
                    return LoginService.checkPresentToken();
                }],
                trips: ["checkLoginBefore", "TripsService", function (checkLoginBefore, TripsService) {
                    return TripsService.getTrips();
                }]
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
                trip: ["checkLoginBefore", "TripsService", "$stateParams", function (checkLoginBefore, TripsService, $stateParams) {
                    return TripsService.getTrip($stateParams.tripId);
                }]
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
                step: ["checkLoginBefore", "StepsService", "$stateParams", function (checkLoginBefore, StepsService, $stateParams) {
                    return StepsService.getStepOfTrip($stateParams.tripId, $stateParams.stepId);
                }]
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
}]);

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

},{"./content/content.controller":4,"./content/content.tpl.html":6,"./content/error/notFound.tpl.html":8,"./content/login/login.controller":9,"./content/login/login.tpl.html":11,"./content/stepDetail/stepDetail.controller":14,"./content/stepDetail/stepDetail.tpl.html":16,"./content/stepOverview/stepOverview.controller":17,"./content/stepOverview/stepOverview.tpl.html":20,"./content/trip/tripOverview.tpl.html":23,"./welcome/welcome.tpl.html":64,"modules/alert":1,"modules/config":3,"modules/content":5,"modules/error":7,"modules/loadingSpinner":26,"modules/loginResource":37,"modules/stepsResource":40,"modules/tripsResource":43,"modules/welcome":63}],45:[function(require,module,exports){
'use strict';

// @ngInject
TriplogGalleryController.$inject = ["$rootScope", "Lightbox"];
function TriplogGalleryController($rootScope, Lightbox) {

    var vm = this;

    vm.pictures.sort(byCaptureDate);

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.pictures, index);
    };

    $rootScope.$on('triplogOpenPicture', function (e, pictureName) {
        var pictureIndex = getIndexByPictureName(pictureName);

        if (pictureIndex >= 0) {
            Lightbox.openModal(vm.pictures, pictureIndex);
        }
    });

    function byCaptureDate(picture1, picture2) {
        return picture1.captureDate.localeCompare(picture2.captureDate);
    }

    function getIndexByPictureName(pictureName) {
        var pictureIndex = -1;

        vm.pictures.forEach(function (picture, index) {
            if (picture.name === pictureName) {
                pictureIndex = index;
            }
        });

        return pictureIndex;
    }
}

module.exports = TriplogGalleryController;

},{}],46:[function(require,module,exports){
'use strict';

function TriplogGalleryDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogGallery.tpl.html',
        scope: {
            pictures: '='
        },
        controller: require('./triplogGallery.controller'),
        controllerAs: 'triplogGallery',
        bindToController: true
    };
}

module.exports = TriplogGalleryDirective;

},{"./triplogGallery.controller":45}],47:[function(require,module,exports){
var ngModule = angular.module('triplogGallery.lightbox.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogGallery.lightbox.tpl.html',
    '<div class="modal-body"\n' +
    '     ng-swipe-left="Lightbox.nextImage()"\n' +
    '     ng-swipe-right="Lightbox.prevImage()">\n' +
    '\n' +
    '    <div class="lightbox-image-container">\n' +
    '        <img lightbox-src="{{ Lightbox.imageUrl }}" alt="">\n' +
    '        <div class="row lightbox-image-navigation">\n' +
    '            <div class="col-xs-6 col-sm-3 lightbox-navigation-button prev" ng-click="Lightbox.prevImage()">\n' +
    '                <div class="lightbox-navigation-button-text">\n' +
    '                    <span class="icon-prev"></span>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="col-xs-6 col-sm-3 col-sm-offset-6 lightbox-navigation-button next" ng-click="Lightbox.nextImage()">\n' +
    '                <div class="lightbox-navigation-button-text">\n' +
    '                    <span class="icon-next"></span>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],48:[function(require,module,exports){
'use strict';

module.exports = angular.module('triplogGallery', [
    'bootstrapLightbox',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogGallery.tpl.html').name,
    require('./triplogGallery.lightbox.tpl.html').name
]);

module.exports.config(['LightboxProvider', function (LightboxProvider) {
    LightboxProvider.templateUrl = 'triplogGallery.lightbox.tpl.html';

    LightboxProvider.calculateModalDimensions = function (dimensions) {
        return {
            'width': dimensions.imageDisplayWidth + 32,
            'height': 'auto'
        };
    };
}]);

module.exports.directive('triplogGallery', require('./triplogGallery.directive'));
},{"./triplogGallery.directive":46,"./triplogGallery.lightbox.tpl.html":47,"./triplogGallery.tpl.html":49}],49:[function(require,module,exports){
var ngModule = angular.module('triplogGallery.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogGallery.tpl.html',
    '<div class="triplog-gallery">\n' +
    '    <div ng-repeat="picture in triplogGallery.pictures" class="gallery-picture">\n' +
    '        <div style="background-image: url(\'{{ picture.url }}\')"\n' +
    '             ng-click="triplogGallery.showFullPicture($index)">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],50:[function(require,module,exports){
'use strict';

// @ngInject
TriplogMapDirective.$inject = ["MAP_BOX_ACCESS_TOKEN", "MAP_BOX_STYLE"];
function TriplogMapDirective(MAP_BOX_ACCESS_TOKEN, MAP_BOX_STYLE) {

    var polyline;

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'triplogMap.tpl.html',
        scope: {
            gpsPoints: '=',
            pictures: '='
        },
        link: function (scope, element) {
            L.mapbox.accessToken = MAP_BOX_ACCESS_TOKEN;
            var map = L.mapbox.map(element[0], MAP_BOX_STYLE);
            map.scrollWheelZoom.disable();

            addFullScreenControl(map);
            addGpsPoints(map, scope.gpsPoints);
            addPictures(map, scope.pictures, scope);

            var coveredDistance = calcDistance();
            console.log('coveredDistance', coveredDistance.distance + ' ' + coveredDistance.unit);
        }
    };


    function calcDistance() {
        var latlngs = polyline._latlngs,
            coveredDistance = 0;

        for (var i = 1; i < latlngs.length; i++) {
            coveredDistance += latlngs[i - 1].distanceTo(latlngs[i]);
        }

        if (coveredDistance >= 10000) {
            // Show distance in km
            return {
                distance: Math.round(coveredDistance / 100) / 10,
                unit: 'km'
            };
        } else {
            // Show distance in m
            return {
                distance: Math.round(coveredDistance * 10) / 10,
                unit: 'm'
            };
        }
    }

    function onlyDisplayablePictures(picture) {
        return picture.location && picture.location.lng && picture.location.lat && picture.width && picture.height;
    }

    function pictureToGeoJson(picture) {
        var iconSize = calculateIconSize(picture);

        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [picture.location.lng, picture.location.lat]
            },
            properties: {
                title: picture.caption,
                pictureName: picture.name,
                icon: {
                    iconUrl: picture.url,
                    iconSize: iconSize,
                    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
                    popupAnchor: [0, iconSize[1] / 2 * -1],
                    className: 'picture-marker'
                }
            }
        };
    }

    function calculateIconSize(picture) {
        var longEdge = 150;

        if (picture.width > picture.height) {
            return [longEdge, picture.height * (longEdge / picture.width)];
        }

        return [picture.width * (longEdge / picture.height), longEdge];
    }

    function addGpsPoints(map, gpsPoints) {
        polyline = L.polyline(gpsPoints, {color: 'red'}).addTo(map);
        map.fitBounds(polyline.getBounds());
    }

    function addPictures(map, pictures, scope) {
        if (pictures && pictures.length > 0) {
            var pictureLayer = L.mapbox.featureLayer();

            pictureLayer.on('layeradd', function (e) {
                var marker = e.layer,
                    feature = marker.feature;

                marker.setIcon(L.icon(feature.properties.icon));
            });

            pictureLayer.setGeoJSON(pictures.filter(onlyDisplayablePictures).map(pictureToGeoJson));

            var clusterGroup = new L.MarkerClusterGroup();
            pictureLayer.eachLayer(function (layer) {
                clusterGroup.addLayer(layer);
            });
            map.addLayer(clusterGroup);

            pictureLayer.on('click', function(e) {
                scope.$emit('triplogOpenPicture', e.layer.feature.properties.pictureName);
            });
        }
    }

    function addFullScreenControl(map) {
        L.control.fullscreen().addTo(map);

        map.on('enterFullscreen', function () {
            map.scrollWheelZoom.enable();
        });

        map.on('exitFullscreen', function () {
            map.scrollWheelZoom.disable();
        });
    }
}

module.exports = TriplogMapDirective;

},{}],51:[function(require,module,exports){
'use strict';

module.exports = angular.module('triplogMap', [
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogMap.tpl.html').name
]);

module.exports.directive('triplogMap', require('./triplogMap.directive'));
},{"./triplogMap.directive":50,"./triplogMap.tpl.html":52,"modules/config":3}],52:[function(require,module,exports){
var ngModule = angular.module('triplogMap.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogMap.tpl.html',
    '<div class="triplog-map-container"></div>');
}]);

module.exports = ngModule;
},{}],53:[function(require,module,exports){
'use strict';

// @ngInject
function TriplogTile() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTile.tpl.html',
        scope: {
            tileTitle: '@',
            picture: '@'
        }
    };
}

module.exports = TriplogTile;

},{}],54:[function(require,module,exports){
'use strict';

module.exports = angular.module('triplogTile', [

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogTileBox.tpl.html').name,
    require('./triplogTile.tpl.html').name
]);

module.exports.directive('triplogTileBox', require('./triplogTileBox.directive'));
module.exports.directive('triplogTile', require('./triplogTile.directive'));
},{"./triplogTile.directive":53,"./triplogTile.tpl.html":55,"./triplogTileBox.directive":56,"./triplogTileBox.tpl.html":57}],55:[function(require,module,exports){
var ngModule = angular.module('triplogTile.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogTile.tpl.html',
    '<article class="triplog-tile">\n' +
    '    <div ng-if="picture" class="cover-picture" style="background-image: url(\'{{ picture }}\')"></div>\n' +
    '    <h2>{{tileTitle}}</h2>\n' +
    '    <div class="triplog-lead" ng-transclude></div>\n' +
    '</article>');
}]);

module.exports = ngModule;
},{}],56:[function(require,module,exports){
'use strict';

// @ngInject
function TriplogTileBox() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTileBox.tpl.html',
        scope: false
    };
}

module.exports = TriplogTileBox;

},{}],57:[function(require,module,exports){
var ngModule = angular.module('triplogTileBox.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogTileBox.tpl.html',
    '<div class="triplog-tile-box" ng-transclude>\n' +
    '\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}],58:[function(require,module,exports){
'use strict';

// @ngInject
function TriplogTimeline() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTimeline.tpl.html',
        scope: false
    };
}

module.exports = TriplogTimeline;

},{}],59:[function(require,module,exports){
'use strict';

module.exports = angular.module('triplogTimeline', [

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogTimeline.tpl.html').name,
    require('./triplogTimelineMoment.tpl.html').name
]);

module.exports.directive('triplogTimeline', require('./triplogTimeline.directive.js'));
module.exports.directive('triplogTimelineMoment', require('./triplogTimelineMoment.directive.js'));
},{"./triplogTimeline.directive.js":58,"./triplogTimeline.tpl.html":60,"./triplogTimelineMoment.directive.js":61,"./triplogTimelineMoment.tpl.html":62}],60:[function(require,module,exports){
var ngModule = angular.module('triplogTimeline.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogTimeline.tpl.html',
    '<ul class="triplog-timeline" ng-transclude>\n' +
    '\n' +
    '</ul>');
}]);

module.exports = ngModule;
},{}],61:[function(require,module,exports){
'use strict';

// @ngInject
function TriplogTimelineMoment() {

    return {
        require: '^TriplogTimeline',
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'triplogTimelineMoment.tpl.html',
        scope: {
            momentTitle: '@',
            picture: '@',
            fromDate: '@',
            toDate: '@',
            unreadFlag: '=',
            momentSref: '@'
        }
    };
}

module.exports = TriplogTimelineMoment;

},{}],62:[function(require,module,exports){
var ngModule = angular.module('triplogTimelineMoment.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('triplogTimelineMoment.tpl.html',
    '<li>\n' +
    '    <div class="timeline-badge"></div>\n' +
    '    <div class="timeline-panel" ui-sref="{{ momentSref }}">\n' +
    '        <div ng-if="picture" class="timeline-picture" style="background-image: url({{ picture }});"></div>\n' +
    '        <div ng-if="unreadFlag" class="timeline-unread-flag">Unread</div>\n' +
    '        <div class="timeline-heading">\n' +
    '            <div class="timeline-title">{{ momentTitle }}</div>\n' +
    '            <p class="timeline-date">\n' +
    '                <i></i>\n' +
    '                <span ng-if="fromDate !== toDate">\n' +
    '                    <span class="avoid-wrap">{{ fromDate | date:\'fullDate\'}} &ndash;</span>\n' +
    '                    <span class="avoid-wrap">{{ toDate | date:\'fullDate\'}}</span>\n' +
    '                </span>\n' +
    '                <span ng-if="fromDate === toDate">{{ fromDate | date:\'fullDate\'}}</span>\n' +
    '            </p>\n' +
    '        </div>\n' +
    '        <div class="timeline-body" ng-transclude>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</li>');
}]);

module.exports = ngModule;
},{}],63:[function(require,module,exports){
'use strict';

module.exports = angular.module('welcome', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./welcome.tpl.html').name
]);
},{"./welcome.tpl.html":64}],64:[function(require,module,exports){
var ngModule = angular.module('welcome.tpl.html', []);
ngModule.run(['$templateCache', function($templateCache) {
  $templateCache.put('welcome.tpl.html',
    '<div class="page welcome-page">\n' +
    '    <div class="background-image"></div>\n' +
    '\n' +
    '    <div class="content">\n' +
    '        <div class="text-cell">\n' +
    '            <div class="text">\n' +
    '                <h1 class="quote">&laquo;The world is a book, and those who do not travel read only a page.&raquo;</h1>\n' +
    '                <h3 class="author">Saint Augustine</h3>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="button">\n' +
    '        <a ui-sref="content.allTrips" class="btn-glow">\n' +
    '            Be part of the adventure\n' +
    '        </a>\n' +
    '    </div>\n' +
    '</div>');
}]);

module.exports = ngModule;
},{}]},{},[44])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvbW9kdWxlcy9hbGVydC9hbGVydC5tb2R1bGUuanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9hbGVydC9hbGVydC5zZXJ2aWNlLmpzIiwicHVibGljL21vZHVsZXMvY29uZmlnL2NvbmZpZy5tb2R1bGUuanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9jb250ZW50L2NvbnRlbnQuY29udHJvbGxlci5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvY29udGVudC5tb2R1bGUuanMiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L2NvbnRlbnQudHBsLmh0bWwiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L2Vycm9yL2Vycm9yLm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvZXJyb3Ivbm90Rm91bmQudHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9jb250ZW50L2xvZ2luL2xvZ2luLmNvbnRyb2xsZXIuanMiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L2xvZ2luL2xvZ2luLm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvbG9naW4vbG9naW4udHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9jb250ZW50L3N0ZXBEZXRhaWwvZGF0ZUxpbmUuZGlyZWN0aXZlLmpzIiwicHVibGljL21vZHVsZXMvY29udGVudC9zdGVwRGV0YWlsL2RhdGVMaW5lLnRwbC5odG1sIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvY29udGVudC9zdGVwRGV0YWlsL3N0ZXBEZXRhaWwuY29udHJvbGxlci5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvc3RlcERldGFpbC9zdGVwRGV0YWlsLm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvc3RlcERldGFpbC9zdGVwRGV0YWlsLnRwbC5odG1sIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvY29udGVudC9zdGVwT3ZlcnZpZXcvc3RlcE92ZXJ2aWV3LmNvbnRyb2xsZXIuanMiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L3N0ZXBPdmVydmlldy9zdGVwT3ZlcnZpZXcuZWRpdC50cGwuaHRtbCIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvc3RlcE92ZXJ2aWV3L3N0ZXBPdmVydmlldy5tb2R1bGUuanMiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L3N0ZXBPdmVydmlldy9zdGVwT3ZlcnZpZXcudHBsLmh0bWwiLCJwdWJsaWMvbW9kdWxlcy9jb250ZW50L3N0ZXBPdmVydmlldy9zdGVwT3ZlcnZpZXcudmlldy50cGwuaHRtbCIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvdHJpcC90cmlwLm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL2NvbnRlbnQvdHJpcC90cmlwT3ZlcnZpZXcudHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9sb2FkaW5nU3Bpbm5lci9sb2FkaW5nU3Bpbm5lci5jb250cm9sbGVyLmpzIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvbG9hZGluZ1NwaW5uZXIvbG9hZGluZ1NwaW5uZXIuZGlyZWN0aXZlLmpzIiwicHVibGljL21vZHVsZXMvbG9hZGluZ1NwaW5uZXIvbG9hZGluZ1NwaW5uZXIubW9kdWxlLmpzIiwicHVibGljL21vZHVsZXMvbG9hZGluZ1NwaW5uZXIvbG9hZGluZ1NwaW5uZXIudHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9tYXJrZG93blByZXZpZXcvbWFya2Rvd25QcmV2aWV3LmNvbnRyb2xsZXIuanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9tYXJrZG93blByZXZpZXcvbWFya2Rvd25QcmV2aWV3LmRpcmVjdGl2ZS5qcyIsInB1YmxpYy9tb2R1bGVzL21hcmtkb3duUHJldmlldy9tYXJrZG93blByZXZpZXcubW9kdWxlLmpzIiwicHVibGljL21vZHVsZXMvbWFya2Rvd25QcmV2aWV3L21hcmtkb3duUHJldmlldy50cGwuaHRtbCIsInB1YmxpYy9tb2R1bGVzL21vZGFsTWVzc2FnZS9tb2RhbC50cGwuaHRtbCIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL21vZGFsTWVzc2FnZS9tb2RhbEluc3RhbmNlLmNvbnRyb2xsZXIuanMiLCJwdWJsaWMvbW9kdWxlcy9tb2RhbE1lc3NhZ2UvbW9kYWxNZXNzYWdlLm1vZHVsZS5qcyIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL21vZGFsTWVzc2FnZS9zaG93TW9kYWwuZm4uanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9yZXNvdXJjZS9sb2dpbi9sb2dpbi5zZXJ2aWNlLmpzIiwicHVibGljL21vZHVsZXMvcmVzb3VyY2UvbG9naW4vbG9naW5SZXNvdXJjZS5tb2R1bGUuanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy9yZXNvdXJjZS9zdGVwcy9zdGVwcy5yZXNvdXJjZS5qcyIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL3Jlc291cmNlL3N0ZXBzL3N0ZXBzLnNlcnZpY2UuanMiLCJwdWJsaWMvbW9kdWxlcy9yZXNvdXJjZS9zdGVwcy9zdGVwc1Jlc291cmNlLm1vZHVsZS5qcyIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL3Jlc291cmNlL3RyaXBzL3RyaXBzLnJlc291cmNlLmpzIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvcmVzb3VyY2UvdHJpcHMvdHJpcHMuc2VydmljZS5qcyIsInB1YmxpYy9tb2R1bGVzL3Jlc291cmNlL3RyaXBzL3RyaXBzUmVzb3VyY2UubW9kdWxlLmpzIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvdHJpcGxvZ0FwcC5qcyIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL3RyaXBsb2dHYWxsZXJ5L3RyaXBsb2dHYWxsZXJ5LmNvbnRyb2xsZXIuanMiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy90cmlwbG9nR2FsbGVyeS90cmlwbG9nR2FsbGVyeS5kaXJlY3RpdmUuanMiLCJwdWJsaWMvbW9kdWxlcy90cmlwbG9nR2FsbGVyeS90cmlwbG9nR2FsbGVyeS5saWdodGJveC50cGwuaHRtbCIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dHYWxsZXJ5L3RyaXBsb2dHYWxsZXJ5Lm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dHYWxsZXJ5L3RyaXBsb2dHYWxsZXJ5LnRwbC5odG1sIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvdHJpcGxvZ01hcC90cmlwbG9nTWFwLmRpcmVjdGl2ZS5qcyIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dNYXAvdHJpcGxvZ01hcC5tb2R1bGUuanMiLCJwdWJsaWMvbW9kdWxlcy90cmlwbG9nTWFwL3RyaXBsb2dNYXAudHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy90cmlwbG9nVGlsZS90cmlwbG9nVGlsZS5kaXJlY3RpdmUuanMiLCJwdWJsaWMvbW9kdWxlcy90cmlwbG9nVGlsZS90cmlwbG9nVGlsZS5tb2R1bGUuanMiLCJwdWJsaWMvbW9kdWxlcy90cmlwbG9nVGlsZS90cmlwbG9nVGlsZS50cGwuaHRtbCIsIi9Vc2Vycy9uaWNpL3dvcmtzcGFjZS90cmlwbG9nL3RyaXBsb2ctY2xpZW50L3B1YmxpYy9tb2R1bGVzL3RyaXBsb2dUaWxlL3RyaXBsb2dUaWxlQm94LmRpcmVjdGl2ZS5qcyIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dUaWxlL3RyaXBsb2dUaWxlQm94LnRwbC5odG1sIiwiL1VzZXJzL25pY2kvd29ya3NwYWNlL3RyaXBsb2cvdHJpcGxvZy1jbGllbnQvcHVibGljL21vZHVsZXMvdHJpcGxvZ1RpbWVsaW5lL3RyaXBsb2dUaW1lbGluZS5kaXJlY3RpdmUuanMiLCJwdWJsaWMvbW9kdWxlcy90cmlwbG9nVGltZWxpbmUvdHJpcGxvZ1RpbWVsaW5lLm1vZHVsZS5qcyIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dUaW1lbGluZS90cmlwbG9nVGltZWxpbmUudHBsLmh0bWwiLCIvVXNlcnMvbmljaS93b3Jrc3BhY2UvdHJpcGxvZy90cmlwbG9nLWNsaWVudC9wdWJsaWMvbW9kdWxlcy90cmlwbG9nVGltZWxpbmUvdHJpcGxvZ1RpbWVsaW5lTW9tZW50LmRpcmVjdGl2ZS5qcyIsInB1YmxpYy9tb2R1bGVzL3RyaXBsb2dUaW1lbGluZS90cmlwbG9nVGltZWxpbmVNb21lbnQudHBsLmh0bWwiLCJwdWJsaWMvbW9kdWxlcy93ZWxjb21lL3dlbGNvbWUubW9kdWxlLmpzIiwicHVibGljL21vZHVsZXMvd2VsY29tZS93ZWxjb21lLnRwbC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTs7OztBQUdBLFNBQVMsYUFBYSxZQUFZO0lBQzlCLFNBQVMsTUFBTSxNQUFNLEtBQUs7UUFDdEIsV0FBVyxPQUFPLEtBQUs7WUFDbkIsTUFBTTtZQUNOLEtBQUs7Ozs7SUFJYixPQUFPO1FBQ0gsU0FBUyxNQUFNLEtBQUssV0FBVztRQUMvQixNQUFNLE1BQU0sS0FBSyxXQUFXO1FBQzVCLFNBQVMsTUFBTSxLQUFLLFdBQVc7UUFDL0IsT0FBTyxNQUFNLEtBQUssV0FBVzs7OztBQUlyQyxPQUFPLFVBQVUsYUFBYTs7O0FDbkI5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7Ozs7QUFHQSxTQUFTLGtCQUFrQixZQUFZLFFBQVEsU0FBUyxLQUFLLE9BQU8sY0FBYyxjQUFjLGNBQWMsV0FBVzs7SUFFckgsSUFBSSxLQUFLO0lBQ1QsR0FBRyxjQUFjO0lBQ2pCLEdBQUcsUUFBUTs7SUFFWCxHQUFHLG9CQUFvQjtJQUN2QixHQUFHLGtCQUFrQixRQUFRLFVBQVUsYUFBYSxPQUFPOztJQUUzRCxHQUFHLGNBQWMsVUFBVSxXQUFXO01BQ3BDLFdBQVcsTUFBTSxzQkFBc0I7OztJQUd6Qzs7O0lBR0EsV0FBVyxJQUFJLHFCQUFxQjtJQUNwQyxXQUFXLElBQUksdUJBQXVCO0lBQ3RDLFdBQVcsSUFBSSxxQkFBcUI7O0lBRXBDLEdBQUcsbUJBQW1CLFlBQVk7UUFDOUIsSUFBSSxHQUFHLG1CQUFtQjtZQUN0QixHQUFHO2VBQ0E7WUFDSCxHQUFHOzs7O0lBSVgsR0FB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QUFzQjs7O0FDdEJ2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYWxlcnQnLCBbXSk7XG5cbm1vZHVsZS5leHBvcnRzLmZhY3RvcnkoJ0FsZXJ0U2VydmljZScsIHJlcXVpcmUoJy4vYWxlcnQuc2VydmljZScpKTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gQWxlcnRTZXJ2aWNlKCRyb290U2NvcGUpIHtcbiAgICBmdW5jdGlvbiBhbGVydCh0eXBlLCBtc2cpIHtcbiAgICAgICAgJHJvb3RTY29wZS5hbGVydHMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgbXNnOiBtc2dcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogYWxlcnQuYmluZCh1bmRlZmluZWQsICdzdWNjZXNzJyksXG4gICAgICAgIGluZm86IGFsZXJ0LmJpbmQodW5kZWZpbmVkLCAnaW5mbycpLFxuICAgICAgICB3YXJuaW5nOiBhbGVydC5iaW5kKHVuZGVmaW5lZCwgJ3dhcm5pbmcnKSxcbiAgICAgICAgZXJyb3I6IGFsZXJ0LmJpbmQodW5kZWZpbmVkLCAnZGFuZ2VyJylcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0U2VydmljZTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2NvbmZpZycsIFtdKVxuXG4uY29uc3RhbnQoJ1JFU1RfVVJMX1BSRUZJWCcsICdodHRwOi8vbG9jYWxob3N0OjgwODAvc2VydmljZXMnKVxuXG4uY29uc3RhbnQoJ01BUF9CT1hfQUNDRVNTX1RPS0VOJywgJ3BrLmV5SjFJam9pYm1WdmVtVnliMjl1WlNJc0ltRWlPaUk1WWpSbU9ERTRZek0yT0dOaE9UTmhZbUU1TmpRd1lUa3dNemxoWXpRMk55SjkuUmRvSXVwLXpSSi12ZTNlMGNXd2lLdycpXG5cbi5jb25zdGFudCgnTUFQX0JPWF9TVFlMRScsICdtYXBib3guc3RyZWV0cycpXG5cbi5jb25zdGFudCgnRU5WJywgJ2xvY2FsJylcblxuLmNvbnN0YW50KCdHT09HTEVfQU5BTFlUSUNTX1RSQUNLSU5HX0NPREUnLCAnVUEtNjMwOTk1NDUtMicpXG5cbjsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gQ29udGVudENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHN0YXRlLCAkd2luZG93LCBFTlYsIHRyaXBzLCBUcmlwc1NlcnZpY2UsIExvZ2luU2VydmljZSwgQWxlcnRTZXJ2aWNlLCBzaG93TW9kYWwpIHtcblxuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0uZW52aXJvbm1lbnQgPSBFTlY7XG4gICAgdm0udHJpcHMgPSB0cmlwcztcblxuICAgIHZtLm5hdmlnYXRpb25Jc1Nob3duID0gZmFsc2U7XG4gICAgdm0uaXNJb3NGdWxsc2NyZWVuID0gJHdpbmRvdy5uYXZpZ2F0b3Iuc3RhbmRhbG9uZSA/IHRydWUgOiBmYWxzZTtcblxuICAgIHZtLm9wZW5QaWN0dXJlID0gZnVuY3Rpb24gKGltYWdlTmFtZSkge1xuICAgICAgJHJvb3RTY29wZS4kZW1pdCgndHJpcGxvZ09wZW5QaWN0dXJlJywgaW1hZ2VOYW1lKTtcbiAgICB9O1xuXG4gICAgcmVDcmVhdGVOYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBSZWFjdCBvbiBzdGF0ZSBjaGFuZ2VzXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0Jywgc3RhdGVDaGFuZ2VTdGFydCk7XG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBjcmVhdGVTdGVwT3ZlcnZpZXdOYXZCYXJFbnRyeSk7XG4gICAgJHJvb3RTY29wZS4kb24oJ2xvZ2luU3RhdGVDaGFuZ2VkJywgcmVDcmVhdGVOYXZpZ2F0aW9uKTtcblxuICAgIHZtLnRvZ2dsZU5hdmlnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh2bS5uYXZpZ2F0aW9uSXNTaG93bikge1xuICAgICAgICAgICAgdm0uY2xvc2VOYXZpZ2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bS5vcGVuTmF2aWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZtLmNsb3NlTmF2aWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzRGV2aWNlV2l0aFNpZGVOYXZpZ2F0aW9uKCkgJiYgdm0ubmF2aWdhdGlvbklzU2hvd24pIHtcbiAgICAgICAgICAgIHZtLm5hdmlnYXRpb25Jc1Nob3duID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdm0ub3Blbk5hdmlnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpc0RldmljZVdpdGhTaWRlTmF2aWdhdGlvbigpICYmICF2bS5uYXZpZ2F0aW9uSXNTaG93bikge1xuICAgICAgICAgICAgdm0ubmF2aWdhdGlvbklzU2hvd24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZtLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdm0uY2xvc2VOYXZpZ2F0aW9uKCk7XG4gICAgICAgIExvZ2luU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnY29udGVudC5hbGxUcmlwcycsIHt9LCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgICAgICAgICBBbGVydFNlcnZpY2Uuc3VjY2VzcygnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgbG9nZ2VkIG91dC4nKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLmVycm9yKCdUaGVyZSB3YXMgYW4gZXJyb3IgZHVyaW5nIHRoZSBsb2dvdXQgcHJvY2Vzcy4uLiA6KCBQbGVhc2UgdHJ5IGFnYWluLicpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFByaXZhdGUgRnVuY3Rpb25zICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGZ1bmN0aW9uIHJlQ3JlYXRlTmF2aWdhdGlvbigpIHtcbiAgICAgICAgdm0ubmF2QmFyRW50cmllcyA9IFtdO1xuICAgICAgICBjcmVhdGVUcmlwT3ZlcnZpZXdOYXZCYXJFbnRyeSgpO1xuICAgICAgICBjcmVhdGVTdGVwT3ZlcnZpZXdOYXZCYXJFbnRyeSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXRlQ2hhbmdlU3RhcnQoKSB7XG4gICAgICAgIHZtLmNsb3NlTmF2aWdhdGlvbigpO1xuICAgICAgICByZW1vdmVTdGVwT3ZlcnZpZXdOYXZCYXJFbnRyeSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRyaXBPdmVydmlld05hdkJhckVudHJ5KCkge1xuICAgICAgICB2YXIgZW50cmllcyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnT3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgIGljb246ICd0cmlwLW92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdjb250ZW50LmFsbFRyaXBzJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXZpZGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHN0YXRlLmN1cnJlbnQubmFtZSA9PT0gJ2NvbnRlbnQuYWxsVHJpcHMnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICB2bS50cmlwcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmlwKSB7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiB0cmlwLnRyaXBJZCxcbiAgICAgICAgICAgICAgICBuYW1lOiB0cmlwLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIGljb246ICd0cmlwJyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdjb250ZW50LnN0ZXBPdmVydmlldycsIHt0cmlwSWQ6IHRyaXAudHJpcElkfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsnY29udGVudC5zdGVwT3ZlcnZpZXcnLCAnY29udGVudC5zdGVwT2ZUcmlwJ10uaW5kZXhPZigkc3RhdGUuY3VycmVudC5uYW1lKSAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5wYXJhbXMudHJpcElkID09PSB0cmlwLnRyaXBJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCRyb290U2NvcGUubG9nZ2VkSW4pIHtcbiAgICAgICAgICAgIGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXS5kaXZpZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZGRUcmlwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnQWRkIHRyaXAnLFxuICAgICAgICAgICAgICAgIGljb246ICdhZGQnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90IHlldCBpbXBsZW1lbnRlZC4uLiA6KCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9UT0RPIEltcGxlbWVudCBmdW5jdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdm0ubmF2QmFyRW50cmllcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiAndHJpcHMnLFxuICAgICAgICAgICAgbmFtZTogJ1RyaXBzJyxcbiAgICAgICAgICAgIGljb246ICd0cmlwLW92ZXJ2aWV3JyxcbiAgICAgICAgICAgIGVudHJpZXM6IGVudHJpZXNcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTdGVwT3ZlcnZpZXdOYXZCYXJFbnRyeSgpIHtcbiAgICAgICAgaWYgKFsnY29udGVudC5zdGVwT3ZlcnZpZXcnLCAnY29udGVudC5zdGVwT2ZUcmlwJ10uaW5kZXhPZigkc3RhdGUuY3VycmVudC5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciB0cmlwSWQgPSAkc3RhdGUucGFyYW1zLnRyaXBJZCxcbiAgICAgICAgICAgICAgICBlbnRyaWVzID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdPdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnc3RlcC1vdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2NvbnRlbnQuc3RlcE92ZXJ2aWV3Jywge3RyaXBJZDogdHJpcElkLCBlZGl0OiB1bmRlZmluZWR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXZpZGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZS5jdXJyZW50Lm5hbWUgPT09ICdjb250ZW50LnN0ZXBPdmVydmlldycgJiYgISRzdGF0ZS5wYXJhbXMuZWRpdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdHJpcEluZGV4ID0gaW5kZXhPZlRyaXBXaXRoSWQodHJpcElkKTtcblxuICAgICAgICAgICAgaWYgKHRyaXBJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdm0udHJpcHNbdHJpcEluZGV4XS5zdGVwcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RlcC5zdGVwSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBzdGVwLnN0ZXBOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ3N0ZXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdjb250ZW50LnN0ZXBPZlRyaXAnLCB7dHJpcElkOiB0cmlwSWQsIHN0ZXBJZDogc3RlcC5zdGVwSWR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHN0YXRlLnBhcmFtcy50cmlwSWQgPT09IHRyaXBJZCAmJiAkc3RhdGUucGFyYW1zLnN0ZXBJZCA9PT0gc3RlcC5zdGVwSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUubG9nZ2VkSW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdLmRpdmlkZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5jb25jYXQodHJpcENvbnRyb2xzKHRyaXBJZCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZtLm5hdkJhckVudHJpZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cmlwSWQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHZtLnRyaXBzW3RyaXBJbmRleF0uZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGljb246ICd0cmlwJyxcbiAgICAgICAgICAgICAgICAgICAgZW50cmllczogZW50cmllc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlU3RlcE92ZXJ2aWV3TmF2QmFyRW50cnkoKSB7XG4gICAgICAgIHZhciB0cmlwSWQgPSAkc3RhdGUucGFyYW1zLnRyaXBJZDtcbiAgICAgICAgaWYgKHRyaXBJZCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPZk5hdkJhckVudHJ5V2l0aElkKHRyaXBJZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIHZtLm5hdkJhckVudHJpZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluZGV4T2ZOYXZCYXJFbnRyeVdpdGhJZChpZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZtLm5hdkJhckVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh2bS5uYXZCYXJFbnRyaWVzW2ldLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluZGV4T2ZUcmlwV2l0aElkKHRyaXBJZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZtLnRyaXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodm0udHJpcHNbaV0udHJpcElkID09PSB0cmlwSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RldmljZVdpdGhTaWRlTmF2aWdhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICR3aW5kb3cuaW5uZXJXaWR0aCA8IDc2ODtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmlwQ29udHJvbHModHJpcElkKSB7XG4gICAgICAgIHZhciBjb250cm9scyA9IFtdO1xuXG4gICAgICAgIGNvbnRyb2xzLnB1c2goe1xuICAgICAgICAgICAgaWQ6ICdlZGl0VHJpcCcsXG4gICAgICAgICAgICBuYW1lOiAnRWRpdCBUcmlwJyxcbiAgICAgICAgICAgIGljb246ICdlZGl0JyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnY29udGVudC5zdGVwT3ZlcnZpZXcnLCB7dHJpcElkOiB0cmlwSWQsIGVkaXQ6IHRydWV9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHN0YXRlLmN1cnJlbnQubmFtZSA9PT0gJ2NvbnRlbnQuc3RlcE92ZXJ2aWV3JyAmJiAkc3RhdGUucGFyYW1zLmVkaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRyb2xzLnB1c2goe1xuICAgICAgICAgICAgaWQ6ICdkZWxldGVUcmlwJyxcbiAgICAgICAgICAgIG5hbWU6ICdEZWxldGUgVHJpcCcsXG4gICAgICAgICAgICBpY29uOiAnZGVsZXRlJyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB0cmlwID0gdHJpcHNbaW5kZXhPZlRyaXBXaXRoSWQodHJpcElkKV0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZVRyaXBNb2RhbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSAnICsgdHJpcC50cmlwTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdDYXV0aW9uOiBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuIEFsbCB0cmlwIGRhdGEgaW5jbHVkaW5nIGFsbCBzdHBlcyBhbmQgcGljdHVyZXMgd2lsbCBiZSBkZWxldGVkIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBva1RleHQ6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2tDbGFzczogJ2J0bi1kYW5nZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsVGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDbGFzczogJ2J0bi1wcmltYXJ5J1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2hvd01vZGFsKGRlbGV0ZVRyaXBNb2RhbERhdGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBUcmlwc1NlcnZpY2UuZGVsZXRlVHJpcCh0cmlwSWQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2NvbnRlbnQuYWxsVHJpcHMnLCB7fSwge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLnN1Y2Nlc3MoJ1RyaXAgJyArIHRyaXAudHJpcE5hbWUgKyAnIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkZWxldGVkLicpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdHJpcCB3aXRoIGlkICcsIHRyaXBJZCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLmVycm9yKGVycm9yLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRyb2xzLnB1c2goe1xuICAgICAgICAgICAgaWQ6ICdhZGRTdGVwJyxcbiAgICAgICAgICAgIG5hbWU6ICdBZGQgc3RlcCcsXG4gICAgICAgICAgICBpY29uOiAnYWRkJyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3QgeWV0IGltcGxlbWVudGVkLi4uIDooJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWN0aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvL1RPRE8gSW1wbGVtZW50IGZ1bmN0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb250cm9scztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udGVudENvbnRyb2xsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdjb250ZW50JywgW1xuICAgICdoYy5tYXJrZWQnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvdHJpcCcpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9zdGVwT3ZlcnZpZXcnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvc3RlcERldGFpbCcpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9sb2dpbicpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9jb25maWcnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvdHJpcHNSZXNvdXJjZScpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9sb2dpblJlc291cmNlJykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2FsZXJ0JykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL21vZGFsTWVzc2FnZScpLm5hbWUsXG5cbiAgICAvLyBUZW1wbGF0ZSBtb2R1bGUgZGVwZW5kZW5jaWVzIChjcmVhdGVkIHdpdGggYnJvd3NlcmlmeS1uZy1odG1sMmpzKVxuICAgIHJlcXVpcmUoJy4vY29udGVudC50cGwuaHRtbCcpLm5hbWVcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cy5jb25maWcoWydtYXJrZWRQcm92aWRlcicsICdSRVNUX1VSTF9QUkVGSVgnLCBmdW5jdGlvbiAobWFya2VkUHJvdmlkZXIsIFJFU1RfVVJMX1BSRUZJWCkge1xuICAgIG1hcmtlZFByb3ZpZGVyLnNldFJlbmRlcmVyKHtcbiAgICAgICAgaGVhZGluZzogZnVuY3Rpb24gKHRleHQsIGxldmVsKSB7XG4gICAgICAgICAgICB2YXIgc3ViTGV2ZWwgPSBsZXZlbCArIDE7XG4gICAgICAgICAgICByZXR1cm4gJzxoJyArIHN1YkxldmVsICsgJz4nICsgdGV4dCArICc8L2gnICsgc3ViTGV2ZWwgKyAnPic7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW1hZ2U6IGZ1bmN0aW9uIChocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgICAgICAgICAgaHJlZiA9IGhyZWYgfHwgJyc7XG4gICAgICAgICAgICB2YXIgaW1hZ2VOYW1lO1xuXG4gICAgICAgICAgICBpZiAoaHJlZi5pbmRleE9mKCdodHRwJykgIT09IDApIHtcbiAgICAgICAgICAgICAgICBocmVmID0gUkVTVF9VUkxfUFJFRklYICsgJy8nICsgaHJlZjtcbiAgICAgICAgICAgICAgICBpbWFnZU5hbWUgPSBocmVmLnN1YnN0cihocmVmLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGltZyA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiJztcbiAgICAgICAgICAgIGltZyArPSB0ZXh0ID8gJyBhbHQ9XCInICsgdGV4dCArICdcIicgOiAnJztcbiAgICAgICAgICAgIGltZyArPSBpbWFnZU5hbWUgPyAnIG9uY2xpY2s9XCJhbmd1bGFyLmVsZW1lbnQodGhpcykuc2NvcGUoKS5jb250ZW50Lm9wZW5QaWN0dXJlKFxcJycgKyBpbWFnZU5hbWUgKyAnXFwnKVwiJyA6ICcnO1xuICAgICAgICAgICAgaW1nICs9ICc+JztcblxuICAgICAgICAgICAgcmV0dXJuIGltZztcbiAgICAgICAgfVxuICAgIH0pO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cy5jb250cm9sbGVyKCdDb250ZW50Q29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udGVudC5jb250cm9sbGVyJykpO1xuXG5tb2R1bGUuZXhwb3J0cy5jb25zdGFudCgnQ09OVEVOVF9TVE9SQUdFX0tFWVMnLCB7XG4gICAgUkVBRF9TVEVQUzogJ3JlYWQtc3RlcHMnXG59KTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnY29udGVudC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjb250ZW50LnRwbC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBhZ2UgY29udGVudC1wYWdlXCIgbmctY2xhc3M9XCJ7IFxcJ25hdmlnYXRpb24taXMtc2hvd25cXCc6IGNvbnRlbnQubmF2aWdhdGlvbklzU2hvd24gfVwiPlxcbicgK1xuICAgICcgICAgPG5hdiBjbGFzcz1cIm5hdmJhciBuYXZiYXItZGVmYXVsdCBuYXZiYXItZml4ZWQtdG9wXCIgcm9sZT1cIm5hdmlnYXRpb25cIiBuZy1jbGFzcz1cInsgXFwnaW9zLXN0YXR1cy1iYXJcXCc6IGNvbnRlbnQuaXNJb3NGdWxsc2NyZWVuIH1cIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwibmF2YmFyLWhlYWRlclwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm5hdmJhci10b2dnbGVcIiBuZy1jbGFzcz1cInsgXFwnYWN0aXZlXFwnOiBjb250ZW50Lm5hdmlnYXRpb25Jc1Nob3duIH1cIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY29udGVudC50b2dnbGVOYXZpZ2F0aW9uKClcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3Itb25seVwiPlRvZ2dsZSBuYXZpZ2F0aW9uPC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWJhclwiPjwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbi1iYXJcIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24tYmFyXCI+PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2J1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGEgY2xhc3M9XCJuYXZiYXItYnJhbmRcIiB1aS1zcmVmPVwid2VsY29tZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2dvIGljb24tdHJpcGxvZ1wiPjwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dFwiPkJyb3MuUGljczwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9hPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8IS0tIENvbGxlY3QgdGhlIG5hdiBsaW5rcywgZm9ybXMsIGFuZCBvdGhlciBjb250ZW50IGZvciB0b2dnbGluZyAtLT5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwibmF2YmFyLWNvbGxhcHNlXCIgbmctc3dpcGUtcmlnaHQ9XCJjb250ZW50LmNsb3NlTmF2aWdhdGlvbigpXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDx1bCBjbGFzcz1cIm5hdiBuYXZiYXItbmF2XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8IS0tIE5vcm1hbCBMaW5rIC0tPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGxpIG5nLXJlcGVhdC1zdGFydD1cImVudHJ5IGluIGNvbnRlbnQubmF2QmFyRW50cmllc1wiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7IGFjdGl2ZTogZW50cnkuYWN0aXZlKCkgfVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgbmctaWY9XCIhZW50cnkuZW50cmllc1wiPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8YSBocmVmIG5nLWNsaWNrPVwiZW50cnkuYWN0aW9uKClcIj48c3BhbiBjbGFzcz1cImljb24te3sgZW50cnkuaWNvbiB9fVwiPjwvc3Bhbj4ge3sgZW50cnkubmFtZSB9fTwvYT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDwvbGk+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPCEtLSBEcm9wZG93biAtLT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxsaSBuZy1jbGFzcz1cInsgYWN0aXZlOiBlbnRyeS5hY3RpdmUoKSB9XCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImRyb3Bkb3duXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICB1aWItZHJvcGRvd25cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBvbi10b2dnbGU9XCJ0b2dnbGVkKG9wZW4pXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBuZy1pZj1cImVudHJ5LmVudHJpZXNcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdC1lbmQ+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDxhIGhyZWYgY2xhc3M9XCJkcm9wZG93bi10b2dnbGVcIiByb2xlPVwiYnV0dG9uXCIgdWliLWRyb3Bkb3duLXRvZ2dsZT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLXt7IGVudHJ5Lmljb24gfX1cIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICAgIHt7IGVudHJ5Lm5hbWUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWRyb3Bkb3duXCI+PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDwvYT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiIHJvbGU9XCJtZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBuZy1jbGFzcz1cInsgYWN0aXZlOiBkcm9wRG93bkVudHJ5LmFjdGl2ZSgpIH1cIiBuZy1yZXBlYXQtc3RhcnQ9XCIoZHJvcERvd25FbnRyeUlkLCBkcm9wRG93bkVudHJ5KSBpbiBlbnRyeS5lbnRyaWVzXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmIG5nLWNsaWNrPVwiZHJvcERvd25FbnRyeS5hY3Rpb24oKVwiPjxzcGFuXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi17eyBkcm9wRG93bkVudHJ5Lmljb24gfX1cIj48L3NwYW4+IHt7IGRyb3BEb3duRW50cnkubmFtZSB9fTwvYT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiZGl2aWRlclwiIG5nLWlmPVwiZHJvcERvd25FbnRyeS5kaXZpZGVyXCIgbmctcmVwZWF0LWVuZD48L2xpPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDwvdWw+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L2xpPlxcbicgK1xuICAgICcgICAgICAgICAgICA8L3VsPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgPHVsIGNsYXNzPVwibmF2IG5hdmJhci1uYXYgbmF2YmFyLXJpZ2h0XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8bGkgbmctaWY9XCIhbG9nZ2VkSW5cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8YSB1aS1zcmVmPVwiY29udGVudC5sb2dpblwiPjxzcGFuIGNsYXNzPVwiaWNvbi1sb2dpblwiPjwvc3Bhbj4gTG9naW48L2E+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L2xpPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGxpIG5nLWlmPVwibG9nZ2VkSW5cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8YSBocmVmIG5nLWNsaWNrPVwiY29udGVudC5sb2dvdXQoKVwiPjxzcGFuIGNsYXNzPVwiaWNvbi1sb2dpblwiPjwvc3Bhbj4gTG9nb3V0PC9hPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9saT5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC91bD5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvbmF2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxtYWluIGNsYXNzPVwiY29udGVudC1jb250YWluZXJcIiBuZy1jbGFzcz1cInsgXFwnaW9zLXN0YXR1cy1iYXItcHJlc2VudFxcJzogY29udGVudC5pc0lvc0Z1bGxzY3JlZW4gfVwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItZmx1aWRcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgbmctc3dpcGUtbGVmdD1cImNvbnRlbnQub3Blbk5hdmlnYXRpb24oKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICBuZy1zd2lwZS1yaWdodD1cImNvbnRlbnQuY2xvc2VOYXZpZ2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgbmctc3dpcGUtZGlzYWJsZS1tb3VzZT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLWxnLTggY29sLWxnLW9mZnNldC0yIHVpLXZpZXctY29udGFpbmVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIiB1aS12aWV3PjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9tYWluPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2Vycm9yJywgW1xuICAgIC8vIFRlbXBsYXRlIG1vZHVsZSBkZXBlbmRlbmNpZXMgKGNyZWF0ZWQgd2l0aCBicm93c2VyaWZ5LW5nLWh0bWwyanMpXG4gICAgcmVxdWlyZSgnLi9ub3RGb3VuZC50cGwuaHRtbCcpLm5hbWVcbl0pOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdub3RGb3VuZC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdub3RGb3VuZC50cGwuaHRtbCcsXG4gICAgJzxoMSBjbGFzcz1cImxpbmVcIj5Ob3QgZm91bmQ8L2gxPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHA+V2UgY291bGQgbm90IGZpbmQgd2hhdCB5b3Ugd2hlcmUgbG9va2luZyBmb3IuLi48L3A+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIExvZ2luQ29udHJvbGxlcihMb2dpblNlcnZpY2UsIEFsZXJ0U2VydmljZSwgJHN0YXRlKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIHZtLmxvZ2luRXJyb3IgPSBmYWxzZTtcblxuICAgIHZtLmxvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBMb2dpblNlcnZpY2UubG9naW4odm0udXNlcm5hbWUsIHZtLnBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZWZlcnJlciA9ICRzdGF0ZS5wYXJhbXMucmVmZXJyZXJTdGF0ZTtcbiAgICAgICAgICAgIGlmIChyZWZlcnJlci5zdGF0ZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHJlZmVycmVyLnN0YXRlLm5hbWUsIHJlZmVycmVyLnBhcmFtcywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2NvbnRlbnQuYWxsVHJpcHMnLCB1bmRlZmluZWQsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLnN1Y2Nlc3MoJ1N1Y2Nlc3NmdWxseSBsb2dnZWQgaW4gYXMgdXNlciAnICsgdm0udXNlcm5hbWUgKyAnLicpO1xuICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVzcG9uc2Uuc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgICAgICAgICAgIHZtLmxvZ2luRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBBbGVydFNlcnZpY2UuZXJyb3IoJ0ludmFsaWQgdXNlcm5hbWUgb3IgcGFzc3dvcmQuJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnb2ZmbGluZSc6XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0U2VydmljZS5pbmZvKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0U2VydmljZS5lcnJvcignQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZCBkdXJpbmcgdGhlIGxvZ2luIHByb2Nlc3MuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5Db250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbG9naW4nLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9sb2dpblJlc291cmNlJykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2FsZXJ0JykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2NvbmZpZycpLm5hbWUsXG5cbiAgICAvLyBUZW1wbGF0ZSBtb2R1bGUgZGVwZW5kZW5jaWVzIChjcmVhdGVkIHdpdGggYnJvd3NlcmlmeS1uZy1odG1sMmpzKVxuICAgIHJlcXVpcmUoJy4vbG9naW4udHBsLmh0bWwnKS5uYW1lXG5dKTtcblxubW9kdWxlLmV4cG9ydHMuY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgcmVxdWlyZSgnLi9sb2dpbi5jb250cm9sbGVyJykpOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdsb2dpbi50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2dpbi50cGwuaHRtbCcsXG4gICAgJzxoMSBjbGFzcz1cImxpbmVcIj5Mb2dpbjwvaDE+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS04IGNvbC1zbS1vZmZzZXQtMiBjb2wtbWQtNCBjb2wtbWQtb2Zmc2V0LTRcIj5cXG4nICtcbiAgICAnICAgIDxmb3JtIGNsYXNzPVwiZm9ybS1ob3Jpem9udGFsXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIiBuZy1jbGFzcz1cIntcXCdoYXMtZXJyb3JcXCc6IGxvZ2luLmxvZ2luRXJyb3J9XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uIGljb24tdXNlclwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtbGdcIiBwbGFjZWhvbGRlcj1cIlVzZXJuYW1lXCIgbmctbW9kZWw9XCJsb2dpbi51c2VybmFtZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLWNsYXNzPVwie1xcJ2hhcy1lcnJvclxcJzogbG9naW4ubG9naW5FcnJvcn1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb24gaWNvbi1wYXNzd29yZFwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LWxnXCIgcGxhY2Vob2xkZXI9XCJQYXNzd29yZFwiIG5nLW1vZGVsPVwibG9naW4ucGFzc3dvcmRcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgdGV4dC1jZW50ZXJcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tbGdcIiBuZy1jbGljaz1cImxvZ2luLmxvZ2luKClcIiBuZy1kaXNhYmxlZD1cIiEobG9naW4udXNlcm5hbWUgJiYgbG9naW4ucGFzc3dvcmQpXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24tbG9naW5cIj48L3NwYW4+IExvZ2luXFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9mb3JtPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gRGF0ZUxpbmUoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2RhdGVMaW5lLnRwbC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGZyb21EYXRlOiAnQCcsXG4gICAgICAgICAgICB0b0RhdGU6ICdAJ1xuICAgICAgICB9XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEYXRlTGluZTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnZGF0ZUxpbmUudHBsLmh0bWwnLCBbXSk7XG5uZ01vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZGF0ZUxpbmUudHBsLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwiZGF0ZUxpbmVcIj5cXG4nICtcbiAgICAnICAgIDxzcGFuIG5nLWlmPVwiZnJvbURhdGUgIT09IHRvRGF0ZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwiYXZvaWQtd3JhcFwiPnt7IGZyb21EYXRlIHwgZGF0ZTpcXCdmdWxsRGF0ZVxcJ319ICZuZGFzaDs8L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJhdm9pZC13cmFwXCI+e3sgdG9EYXRlIHwgZGF0ZTpcXCdmdWxsRGF0ZVxcJ319PC9zcGFuPlxcbicgK1xuICAgICcgICAgPC9zcGFuPlxcbicgK1xuICAgICcgICAgPHNwYW4gbmctaWY9XCJmcm9tRGF0ZSA9PT0gdG9EYXRlXCI+e3sgZnJvbURhdGUgfCBkYXRlOlxcJ2Z1bGxEYXRlXFwnfX08L3NwYW4+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBTdGVwRGV0YWlsQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc3RhdGUsIHN0ZXAsIENPTlRFTlRfU1RPUkFHRV9LRVlTLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2bS5zdGVwID0gc3RlcDtcbiAgICB2bS5nYWxsZXJ5UGljdHVyZXMgPSBzdGVwLnBpY3R1cmVzLmZpbHRlcihmdW5jdGlvbiAocGljdHVyZSkge1xuICAgICAgICByZXR1cm4gcGljdHVyZS5zaG93bkluR2FsbGVyeTtcbiAgICB9KTtcblxuICAgIG1hcmtTdGVwQXNSZWFkKCk7XG5cbiAgICAkc3RhdGUuY3VycmVudC5kYXRhLnBhZ2VUaXRsZSA9IHZtLnN0ZXAuc3RlcE5hbWU7XG5cbiAgICB2bS5zaG93TWFwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJHJvb3RTY29wZS5pc09ubGluZSAmJiB2bS5zdGVwLmdwc1BvaW50cyAmJiB2bS5zdGVwLmdwc1BvaW50cy5sZW5ndGggPiAwO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtYXJrU3RlcEFzUmVhZCgpIHtcbiAgICAgICAgdmFyIHJlYWRTdGVwcyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KENPTlRFTlRfU1RPUkFHRV9LRVlTLlJFQURfU1RFUFMpIHx8IFtdO1xuICAgICAgICBpZiAocmVhZFN0ZXBzLmluZGV4T2Yoc3RlcC5mdWxsUXVhbGlmaWVkU3RlcElkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJlYWRTdGVwcy5wdXNoKHN0ZXAuZnVsbFF1YWxpZmllZFN0ZXBJZCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChDT05URU5UX1NUT1JBR0VfS0VZUy5SRUFEX1NURVBTLCByZWFkU3RlcHMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBEZXRhaWxDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnc3RlcERldGFpbCcsIFtcbiAgICByZXF1aXJlKCdtb2R1bGVzL3RyaXBsb2dHYWxsZXJ5JykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL3RyaXBsb2dNYXAnKS5uYW1lLFxuXG4gICAgLy8gVGVtcGxhdGUgbW9kdWxlIGRlcGVuZGVuY2llcyAoY3JlYXRlZCB3aXRoIGJyb3dzZXJpZnktbmctaHRtbDJqcylcbiAgICByZXF1aXJlKCcuL3N0ZXBEZXRhaWwudHBsLmh0bWwnKS5uYW1lLFxuICAgIHJlcXVpcmUoJy4vZGF0ZUxpbmUudHBsLmh0bWwnKS5uYW1lXG5dKTtcblxubW9kdWxlLmV4cG9ydHMuY29udHJvbGxlcignU3RlcERldGFpbENvbnRyb2xsZXInLCByZXF1aXJlKCcuL3N0ZXBEZXRhaWwuY29udHJvbGxlcicpKTtcbm1vZHVsZS5leHBvcnRzLmRpcmVjdGl2ZSgnZGF0ZUxpbmUnLCByZXF1aXJlKCcuL2RhdGVMaW5lLmRpcmVjdGl2ZScpKTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnc3RlcERldGFpbC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdzdGVwRGV0YWlsLnRwbC5odG1sJyxcbiAgICAnPGhlYWRlcj5cXG4nICtcbiAgICAnICAgIDxoMSBjbGFzcz1cImxpbmVcIj57eyBzdGVwRGV0YWlsLnN0ZXAuc3RlcE5hbWUgfX08L2gxPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxkYXRlLWxpbmUgZnJvbS1kYXRlPVwie3sgc3RlcERldGFpbC5zdGVwLmZyb21EYXRlIH19XCIgdG8tZGF0ZT1cInt7IHN0ZXBEZXRhaWwuc3RlcC50b0RhdGUgfX1cIj48L2RhdGUtbGluZT5cXG4nICtcbiAgICAnPC9oZWFkZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8YXJ0aWNsZSBjbGFzcz1cImNvbHVtbnNcIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0cmlwbG9nLWxlYWRcIj5cXG4nICtcbiAgICAnICAgICAgICB7eyBzdGVwRGV0YWlsLnN0ZXAuc3RlcExlYWQgfX1cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0cmlwbG9nLXRleHRcIiBtYXJrZWQ9XCJzdGVwRGV0YWlsLnN0ZXAuc3RlcFRleHRcIj48L2Rpdj5cXG4nICtcbiAgICAnPC9hcnRpY2xlPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHRyaXBsb2ctbWFwIGdwcy1wb2ludHM9XCJzdGVwRGV0YWlsLnN0ZXAuZ3BzUG9pbnRzXCIgcGljdHVyZXM9XCJzdGVwRGV0YWlsLmdhbGxlcnlQaWN0dXJlc1wiIG5nLWlmPVwic3RlcERldGFpbC5zaG93TWFwKClcIj48L3RyaXBsb2ctbWFwPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHRyaXBsb2ctZ2FsbGVyeSBuZy1pZj1cInN0ZXBEZXRhaWwuZ2FsbGVyeVBpY3R1cmVzICYmIHN0ZXBEZXRhaWwuZ2FsbGVyeVBpY3R1cmVzLmxlbmd0aCA+IDBcIiBwaWN0dXJlcz1cInN0ZXBEZXRhaWwuZ2FsbGVyeVBpY3R1cmVzXCI+PC90cmlwbG9nLWdhbGxlcnk+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8YXNpZGUgY2xhc3M9XCJwcmV2aW91c05leHRTdGVwXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicHJldlwiIG5nLWlmPVwic3RlcERldGFpbC5zdGVwLnByZXZpb3VzU3RlcFwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsaW5rLWhvbGRlclwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICB1aS1zcmVmPVwiY29udGVudC5zdGVwT2ZUcmlwKHt0cmlwSWQ6IFxcJ3t7IHN0ZXBEZXRhaWwuc3RlcC50cmlwSWQgfX1cXCcsIHN0ZXBJZDogXFwne3sgc3RlcERldGFpbC5zdGVwLnByZXZpb3VzU3RlcC5zdGVwSWQgfX1cXCd9KVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uLXByZXZcIj48L2k+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dFwiPiB7eyBzdGVwRGV0YWlsLnN0ZXAucHJldmlvdXNTdGVwLnN0ZXBOYW1lIH19PC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicHJldi1wbGFjZWhvbGRlclwiIG5nLWlmPVwiIXN0ZXBEZXRhaWwuc3RlcC5wcmV2aW91c1N0ZXBcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJuZXh0XCIgbmctaWY9XCJzdGVwRGV0YWlsLnN0ZXAubmV4dFN0ZXBcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwibGluay1ob2xkZXJcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgdWktc3JlZj1cImNvbnRlbnQuc3RlcE9mVHJpcCh7dHJpcElkOiBcXCd7eyBzdGVwRGV0YWlsLnN0ZXAudHJpcElkIH19XFwnLCBzdGVwSWQ6IFxcJ3t7IHN0ZXBEZXRhaWwuc3RlcC5uZXh0U3RlcC5zdGVwSWQgfX1cXCd9KVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dFwiPnt7IHN0ZXBEZXRhaWwuc3RlcC5uZXh0U3RlcC5zdGVwTmFtZSB9fTwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uLW5leHRcIj48L2k+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvYXNpZGU+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIFN0ZXBPdmVydmlld0NvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHN0YXRlLCB0cmlwLCBzaG93TW9kYWwsIFRyaXBzU2VydmljZSwgQWxlcnRTZXJ2aWNlLCBDT05URU5UX1NUT1JBR0VfS0VZUywgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0udHJpcCA9IHRyaXA7XG4gICAgdm0uZWRpdGFibGVUcmlwID0gY3JlYXRlRWRpdGFibGVUcmlwKCk7XG5cbiAgICB2bS5lZGl0TW9kZSA9ICRzdGF0ZS5wYXJhbXMuZWRpdCAmJiAkcm9vdFNjb3BlLmxvZ2dlZEluO1xuXG4gICAgJHN0YXRlLmN1cnJlbnQuZGF0YS5wYWdlVGl0bGUgPSB2bS50cmlwLmRpc3BsYXlOYW1lO1xuXG4gICAgdm0udGVtcGxhdGVUb1Nob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2bS5lZGl0TW9kZSA/ICdzdGVwT3ZlcnZpZXcuZWRpdC50cGwuaHRtbCcgOiAnc3RlcE92ZXJ2aWV3LnZpZXcudHBsLmh0bWwnO1xuICAgIH07XG5cbiAgICB2bS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdm0uZWRpdGFibGVUcmlwID0gY3JlYXRlRWRpdGFibGVUcmlwKCk7XG4gICAgfTtcblxuICAgIHZtLmNhbmNlbEVkaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJ0NhbmNlbCBlZGl0aW5nPycsXG4gICAgICAgICAgICBtZXNzYWdlOiAnQWxsIHlvdXIgY2hhbmdlZCBkYXRhIHdpbGwgYmUgbG9zdC4nLFxuICAgICAgICAgICAgb2tUZXh0OiAnQ2FuY2VsIGFueXdheScsXG4gICAgICAgICAgICBva0NsYXNzOiAnYnRuLWRhbmdlcicsXG4gICAgICAgICAgICBjYW5jZWxUZXh0OiAnQ29udGludWUgZWRpdGluZycsXG4gICAgICAgICAgICBjYW5jZWxDbGFzczogJ2J0bi1wcmltYXJ5J1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnY29udGVudC5zdGVwT3ZlcnZpZXcnLCB7ZWRpdDogdW5kZWZpbmVkfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2bS5zYXZlVHJpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVHJpcHNTZXJ2aWNlLnVwZGF0ZVRyaXAodm0uZWRpdGFibGVUcmlwKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEFsZXJ0U2VydmljZS5zdWNjZXNzKCdUcmlwIGhhcyBiZWVuIHVwZGF0ZWQuJyk7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2NvbnRlbnQuc3RlcE92ZXJ2aWV3Jywge2VkaXQ6IHVuZGVmaW5lZH0sIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZtLmlzVW5yZWFkID0gZnVuY3Rpb24gKHN0ZXApe1xuICAgICAgICB2YXIgcmVhZFN0ZXBzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoQ09OVEVOVF9TVE9SQUdFX0tFWVMuUkVBRF9TVEVQUykgfHwgW107XG4gICAgICAgIHJldHVybiByZWFkU3RlcHMuaW5kZXhPZih0cmlwLnRyaXBJZCArICcvJyArIHN0ZXAuc3RlcElkKSA9PT0gLTE7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVkaXRhYmxlVHJpcCgpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlVHJpcCA9IGFuZ3VsYXIuY29weSh0cmlwKTtcbiAgICAgICAgZWRpdGFibGVUcmlwLnRyaXBEYXRlID0gbmV3IERhdGUodHJpcC50cmlwRGF0ZSk7XG4gICAgICAgIGVkaXRhYmxlVHJpcC5wdWJsaXNoZWQgPSB0cmlwLnB1Ymxpc2hlZCA/IG5ldyBEYXRlKHRyaXAucHVibGlzaGVkKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm4gZWRpdGFibGVUcmlwO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGVwT3ZlcnZpZXdDb250cm9sbGVyOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzdGVwT3ZlcnZpZXcuZWRpdC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdzdGVwT3ZlcnZpZXcuZWRpdC50cGwuaHRtbCcsXG4gICAgJzxmb3JtIGNsYXNzPVwiZm9ybS1ob3Jpem9udGFsXCI+XFxuJyArXG4gICAgJyAgICA8IS0tIFRyaXAgTmFtZSAtLT5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGxhYmVsIGZvcj1cInRyaXAtbmFtZVwiIGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5OYW1lPC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0xMFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwidHJpcC1uYW1lXCIgcGxhY2Vob2xkZXI9XCJUcmlwIE5hbWVcIiBuZy1tb2RlbD1cInN0ZXBPdmVydmlldy5lZGl0YWJsZVRyaXAudHJpcE5hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDwhLS0gVHJpcCBEYXRlIC0tPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWwgZm9yPVwidHJpcC1kYXRlXCIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPkRhdGU8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJ0cmlwLWRhdGVcIiBwbGFjZWhvbGRlcj1cIlRyaXAgTmFtZVwiIG5nLW1vZGVsPVwic3RlcE92ZXJ2aWV3LmVkaXRhYmxlVHJpcC50cmlwRGF0ZVwiPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPCEtLSBUcmlwIExlYWQgLS0+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbCBmb3I9XCJ0cmlwLWxlYWRcIiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+TGVhZDwvbGFiZWw+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMTBcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJ0cmlwLWxlYWRcIiByb3dzPVwiNVwiIG5nLW1vZGVsPVwic3RlcE92ZXJ2aWV3LmVkaXRhYmxlVHJpcC50cmlwTGVhZFwiPjwvdGV4dGFyZWE+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8IS0tIFRyaXAgVGV4dCAtLT5cXG4nICtcbiAgICAnICAgIDxtYXJrZG93bi1wcmV2aWV3IG1vZGVsPVwic3RlcE92ZXJ2aWV3LmVkaXRhYmxlVHJpcC50cmlwVGV4dFwiPjwvbWFya2Rvd24tcHJldmlldz5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8IS0tIENvdmVyIFBpY3R1cmUgLS0+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbCBmb3I9XCJjb3Zlci1waWN0dXJlXCIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPkNvdmVyIFBpY3R1cmU8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJjb3Zlci1waWN0dXJlXCIgcGxhY2Vob2xkZXI9XCJodHRwOi8vdXJsLnRvL2NvdmVyL3BpY3R1cmUuanBnXCIgbmctbW9kZWw9XCJzdGVwT3ZlcnZpZXcuZWRpdGFibGVUcmlwLmNvdmVyUGljdHVyZVwiPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPCEtLSBQdWJsaXNoIERhdGUgLS0+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbCBmb3I9XCJwdWJsaXNoLWRhdGVcIiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+UHVibGlzaCBEYXRlPC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0xMFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImRhdGV0aW1lLWxvY2FsXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInB1Ymxpc2gtZGF0ZVwiIG5nLW1vZGVsPVwic3RlcE92ZXJ2aWV3LmVkaXRhYmxlVHJpcC5wdWJsaXNoZWRcIj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDwhLS0gQnV0dG9ucyAtLT5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy00IGNvbC1zbS1vZmZzZXQtMiBjb2wtc20tMyBidG4tY29sXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCJzdGVwT3ZlcnZpZXcucmVzZXQoKVwiIGNsYXNzPVwiYnRuLXJlc2V0XCI+UmVzZXQ8L2J1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTggY29sLXNtLTcgYnRuLWNvbCByaWdodFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8YnV0dG9uIG5nLWNsaWNrPVwic3RlcE92ZXJ2aWV3LmNhbmNlbEVkaXQoKVwiIGNsYXNzPVwiYnRuLWNhbmNlbFwiPkNhbmNlbDwvYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgICA8YnV0dG9uIG5nLWNsaWNrPVwic3RlcE92ZXJ2aWV3LnNhdmVUcmlwKClcIiBjbGFzcz1cImJ0bi1va1wiPlNhdmU8L2J1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Zvcm0+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdzdGVwT3ZlcnZpZXcnLCBbXG4gICAgcmVxdWlyZSgnbW9kdWxlcy90cmlwbG9nVGltZWxpbmUnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvbW9kYWxNZXNzYWdlJykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL21hcmtkb3duUHJldmlldycpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy90cmlwc1Jlc291cmNlJykubmFtZSxcblxuICAgIC8vIFRlbXBsYXRlIG1vZHVsZSBkZXBlbmRlbmNpZXMgKGNyZWF0ZWQgd2l0aCBicm93c2VyaWZ5LW5nLWh0bWwyanMpXG4gICAgcmVxdWlyZSgnLi9zdGVwT3ZlcnZpZXcudHBsLmh0bWwnKS5uYW1lLFxuICAgIHJlcXVpcmUoJy4vc3RlcE92ZXJ2aWV3LnZpZXcudHBsLmh0bWwnKS5uYW1lLFxuICAgIHJlcXVpcmUoJy4vc3RlcE92ZXJ2aWV3LmVkaXQudHBsLmh0bWwnKS5uYW1lXG5dKTtcblxubW9kdWxlLmV4cG9ydHMuY29udHJvbGxlcignU3RlcE92ZXJ2aWV3Q29udHJvbGxlcicsIHJlcXVpcmUoJy4vc3RlcE92ZXJ2aWV3LmNvbnRyb2xsZXInKSk7IiwidmFyIG5nTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3N0ZXBPdmVydmlldy50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdzdGVwT3ZlcnZpZXcudHBsLmh0bWwnLFxuICAgICc8aDEgY2xhc3M9XCJsaW5lXCI+e3sgc3RlcE92ZXJ2aWV3LnRyaXAuZGlzcGxheU5hbWUgfX08L2gxPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPG5nLWluY2x1ZGUgc3JjPVwic3RlcE92ZXJ2aWV3LnRlbXBsYXRlVG9TaG93KClcIj48L25nLWluY2x1ZGU+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwidmFyIG5nTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3N0ZXBPdmVydmlldy52aWV3LnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3N0ZXBPdmVydmlldy52aWV3LnRwbC5odG1sJyxcbiAgICAnPGFydGljbGUgY2xhc3M9XCJjb2x1bW5zXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidHJpcGxvZy1sZWFkXCI+e3sgc3RlcE92ZXJ2aWV3LnRyaXAudHJpcExlYWQgfX08L2Rpdj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0cmlwbG9nLXRleHRcIiBtYXJrZWQ9XCJzdGVwT3ZlcnZpZXcudHJpcC50cmlwVGV4dFwiPjwvZGl2PlxcbicgK1xuICAgICc8L2FydGljbGU+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8dHJpcGxvZy10aW1lbGluZSBuZy1pZj1cInN0ZXBPdmVydmlldy50cmlwLnN0ZXBzICYmIHN0ZXBPdmVydmlldy50cmlwLnN0ZXBzLmxlbmd0aCA+IDBcIj5cXG4nICtcbiAgICAnICAgIDx0cmlwbG9nLXRpbWVsaW5lLW1vbWVudFxcbicgK1xuICAgICcgICAgICAgICAgICBuZy1yZXBlYXQ9XCJzdGVwIGluIHN0ZXBPdmVydmlldy50cmlwLnN0ZXBzXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgbW9tZW50LXRpdGxlPVwie3sgc3RlcC5zdGVwTmFtZSB9fVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgIHBpY3R1cmU9XCJ7eyBzdGVwLmNvdmVyUGljdHVyZSB9fVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgIGZyb20tZGF0ZT1cInt7IHN0ZXAuZnJvbURhdGUgfX1cIlxcbicgK1xuICAgICcgICAgICAgICAgICB0by1kYXRlPVwie3sgc3RlcC50b0RhdGUgfX1cIlxcbicgK1xuICAgICcgICAgICAgICAgICB1bnJlYWQtZmxhZz1cInN0ZXBPdmVydmlldy5pc1VucmVhZChzdGVwKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgIG1vbWVudC1zcmVmPVwiY29udGVudC5zdGVwT2ZUcmlwKHt0cmlwSWQ6IFxcJ3t7IHN0ZXBPdmVydmlldy50cmlwLnRyaXBJZCB9fVxcJywgc3RlcElkOiBcXCd7eyBzdGVwLnN0ZXBJZCB9fVxcJ30pXCI+XFxuJyArXG4gICAgJyAgICAgICAge3sgc3RlcC5zdGVwTGVhZCB9fVxcbicgK1xuICAgICcgICAgPC90cmlwbG9nLXRpbWVsaW5lLW1vbWVudD5cXG4nICtcbiAgICAnPC90cmlwbG9nLXRpbWVsaW5lPicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgndHJpcCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICByZXF1aXJlKCdtb2R1bGVzL3RyaXBsb2dUaWxlJykubmFtZSxcblxuICAgIC8vIFRlbXBsYXRlIG1vZHVsZSBkZXBlbmRlbmNpZXMgKGNyZWF0ZWQgd2l0aCBicm93c2VyaWZ5LW5nLWh0bWwyanMpXG4gICAgcmVxdWlyZSgnLi90cmlwT3ZlcnZpZXcudHBsLmh0bWwnKS5uYW1lXG5dKTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndHJpcE92ZXJ2aWV3LnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RyaXBPdmVydmlldy50cGwuaHRtbCcsXG4gICAgJzxoMSBjbGFzcz1cImxpbmVcIj5UcmlwIE92ZXJ2aWV3PC9oMT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxwPk9uIHRoaXMgcGFnZSB5b3UgY2FuIHNlZSBhbiBvdmVydmlldyBvdmVyIGFsbCB0cmlwcyB3ZSBhbHJlYWR5IGRpZCBvciBhcmUgcGxhbm5pbmcgdG8gZG8uPC9wPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPHRyaXBsb2ctdGlsZS1ib3g+XFxuJyArXG4gICAgJyAgICA8dHJpcGxvZy10aWxlIG5nLXJlcGVhdD1cInRyaXAgaW4gY29udGVudC50cmlwc1wiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgIHRpbGUtdGl0bGU9XCJ7eyB0cmlwLmRpc3BsYXlOYW1lIH19XCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgcGljdHVyZT1cInt7IHRyaXAuY292ZXJQaWN0dXJlIH19XCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgdWktc3JlZj1cImNvbnRlbnQuc3RlcE92ZXJ2aWV3KHt0cmlwSWQ6IFxcJ3t7IHRyaXAudHJpcElkIH19XFwnfSlcIj5cXG4nICtcbiAgICAnICAgICAgICB7eyB0cmlwLnRyaXBMZWFkIH19XFxuJyArXG4gICAgJyAgICA8L3RyaXBsb2ctdGlsZT5cXG4nICtcbiAgICAnPC90cmlwbG9nLXRpbGUtYm94PicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBMb2FkaW5nU3Bpbm5lckNvbnRyb2xsZXIoJGh0dHApIHtcblxuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5pc1Nob3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAucGVuZGluZ1JlcXVlc3RzLmxlbmd0aCAhPT0gMDtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdTcGlubmVyQ29udHJvbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gTG9hZGluZ1NwaW5uZXJEaXJlY3RpdmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2FkaW5nU3Bpbm5lci50cGwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4vbG9hZGluZ1NwaW5uZXIuY29udHJvbGxlcicpLFxuICAgICAgICBjb250cm9sbGVyQXM6ICdsb2FkaW5nU3Bpbm5lcicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdTcGlubmVyRGlyZWN0aXZlOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbG9hZGluZ1NwaW5uZXInLCBbXG4gICAgLy8gVGVtcGxhdGUgbW9kdWxlIGRlcGVuZGVuY2llcyAoY3JlYXRlZCB3aXRoIGJyb3dzZXJpZnktbmctaHRtbDJqcylcbiAgICByZXF1aXJlKCcuL2xvYWRpbmdTcGlubmVyLnRwbC5odG1sJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmRpcmVjdGl2ZSgnbG9hZGluZ1NwaW5uZXInLCByZXF1aXJlKCcuL2xvYWRpbmdTcGlubmVyLmRpcmVjdGl2ZScpKTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbG9hZGluZ1NwaW5uZXIudHBsLmh0bWwnLCBbXSk7XG5uZ01vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9hZGluZ1NwaW5uZXIudHBsLmh0bWwnLFxuICAgICc8YXNpZGUgY2xhc3M9XCJsb2FkaW5nU3Bpbm5lclwiIG5nLWlmPVwibG9hZGluZ1NwaW5uZXIuaXNTaG93bigpXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiY2VudGVyZWRcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm91bmNlMVwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm91bmNlMlwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm91bmNlM1wiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICBsb2FkaW5nXFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9hc2lkZT4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gTWFya2Rvd25QcmV2aWV3Q29udHJvbGxlcigpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuXG4gICAgdm0ucHJldmlldyA9IGZhbHNlO1xuXG4gICAgdm0udG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2bS5wcmV2aWV3ID0gIXZtLnByZXZpZXc7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXJrZG93blByZXZpZXdDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBNYXJrZG93blByZXZpZXdEaXJlY3RpdmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdtYXJrZG93blByZXZpZXcudHBsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiByZXF1aXJlKCcuL21hcmtkb3duUHJldmlldy5jb250cm9sbGVyLmpzJyksXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ByZXZpZXcnLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbW9kZWw6ICc9J1xuICAgICAgICB9XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXJrZG93blByZXZpZXdEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXJrZG93blByZXZpZXcnLCBbXG4gICAgJ2hjLm1hcmtlZCcsXG5cbiAgICAvLyBUZW1wbGF0ZSBtb2R1bGUgZGVwZW5kZW5jaWVzIChjcmVhdGVkIHdpdGggYnJvd3NlcmlmeS1uZy1odG1sMmpzKVxuICAgIHJlcXVpcmUoJy4vbWFya2Rvd25QcmV2aWV3LnRwbC5odG1sJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmRpcmVjdGl2ZSgnbWFya2Rvd25QcmV2aWV3JywgcmVxdWlyZSgnLi9tYXJrZG93blByZXZpZXcuZGlyZWN0aXZlJykpOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdtYXJrZG93blByZXZpZXcudHBsLmh0bWwnLCBbXSk7XG5uZ01vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbWFya2Rvd25QcmV2aWV3LnRwbC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInRyaXBsb2ctbWFya2Rvd24tcHJldmlld1wiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWwgZm9yPVwidHJpcC10ZXh0XCIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPlRleHQ8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwXCIgbmctc2hvdz1cIiFwcmV2aWV3LnByZXZpZXdcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJ0cmlwLXRleHRcIiByb3dzPVwiMTBcIiBuZy1tb2RlbD1cInByZXZpZXcubW9kZWxcIj48L3RleHRhcmVhPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwXCIgbmctc2hvdz1cInByZXZpZXcucHJldmlld1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlld1wiIG1hcmtlZD1cInByZXZpZXcubW9kZWxcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS1vZmZzZXQtMiBjb2wtc20tMTBcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwicHJldmlldy50b2dnbGUoKVwiPnt7IHByZXZpZXcucHJldmlldyA/IFxcJ0VkaXRcXCcgOiBcXCdQcmV2aWV3XFwnIH19PC9idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwidmFyIG5nTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ21vZGFsLnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ21vZGFsLnRwbC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInRyaXBsb2ctbW9kYWwtaGVhZGVyXCI+XFxuJyArXG4gICAgJyAgICA8aDM+e3sgbW9kYWxJbnN0YW5jZS5tb2RhbERhdGEudGl0bGUgfX08L2gzPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInRyaXBsb2ctbW9kYWwtYm9keVwiPlxcbicgK1xuICAgICcgICAgPHA+e3sgbW9kYWxJbnN0YW5jZS5tb2RhbERhdGEubWVzc2FnZSB9fTwvcD5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJ0cmlwbG9nLW1vZGFsLWZvb3RlclwiPlxcbicgK1xuICAgICcgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4ge3sgbW9kYWxJbnN0YW5jZS5tb2RhbERhdGEuY2FuY2VsQ2xhc3MgfX1cIiBkYXRhLW5nLWNsaWNrPVwibW9kYWxJbnN0YW5jZS5jYW5jZWwoKVwiPlxcbicgK1xuICAgICcgICAgICAgIHt7IG1vZGFsSW5zdGFuY2UubW9kYWxEYXRhLmNhbmNlbFRleHQgfX1cXG4nICtcbiAgICAnICAgIDwvYnV0dG9uPlxcbicgK1xuICAgICcgICAgPGJ1dHRvbiBuZy1pZj1cIm1vZGFsSW5zdGFuY2UubW9kYWxEYXRhLm9rVGV4dFwiIGNsYXNzPVwiYnRuIHt7IG1vZGFsSW5zdGFuY2UubW9kYWxEYXRhLm9rQ2xhc3MgfX1cIiBkYXRhLW5nLWNsaWNrPVwibW9kYWxJbnN0YW5jZS5vaygpXCI+XFxuJyArXG4gICAgJyAgICAgICAge3sgbW9kYWxJbnN0YW5jZS5tb2RhbERhdGEub2tUZXh0IH19XFxuJyArXG4gICAgJyAgICA8L2J1dHRvbj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsSW5zdGFuY2VDb250cm9sbGVyO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIE1vZGFsSW5zdGFuY2VDb250cm9sbGVyKCR1aWJNb2RhbEluc3RhbmNlLCBtb2RhbERhdGEpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuXG4gICAgdm0ubW9kYWxEYXRhID0gbW9kYWxEYXRhO1xuXG4gICAgdm0ub2sgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICR1aWJNb2RhbEluc3RhbmNlLmNsb3NlKHJlc3VsdCk7XG4gICAgfTtcblxuICAgIHZtLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHVpYk1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gICAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21vZGFsTWVzc2FnZScsIFtcbiAgICAndWkuYm9vdHN0cmFwJyxcblxuICAgIC8vIFRlbXBsYXRlIG1vZHVsZSBkZXBlbmRlbmNpZXMgKGNyZWF0ZWQgd2l0aCBicm93c2VyaWZ5LW5nLWh0bWwyanMpXG4gICAgcmVxdWlyZSgnLi9tb2RhbC50cGwuaHRtbCcpLm5hbWVcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cy5mYWN0b3J5KCdzaG93TW9kYWwnLCByZXF1aXJlKCcuL3Nob3dNb2RhbC5mbicpKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvd01vZGFsO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIFNob3dNb2RhbCgkdWliTW9kYWwpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZGFsRGF0YSkge1xuICAgICAgICB2YXIgZGVmYXVsdE1vZGFsRGF0YSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQ29udGludWU/JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdEbyB5b3Ugd2FudCB0byBjb250aW51ZT8nLFxuICAgICAgICAgICAgb2tUZXh0OiAnWWVzJyxcbiAgICAgICAgICAgIG9rQ2xhc3M6ICdidG4tcHJpbWFyeScsXG4gICAgICAgICAgICBjYW5jZWxUZXh0OiAnTm8nLFxuICAgICAgICAgICAgY2FuY2VsQ2xhc3M6ICdidG4tZGFuZ2VyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghbW9kYWxEYXRhKSB7XG4gICAgICAgICAgICBtb2RhbERhdGEgPSBkZWZhdWx0TW9kYWxEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiByZXF1aXJlKCcuL21vZGFsLnRwbC5odG1sJykubmFtZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4vbW9kYWxJbnN0YW5jZS5jb250cm9sbGVyJyksXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdtb2RhbEluc3RhbmNlJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBtb2RhbERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG1vZGFsRGF0YS50aXRsZSB8fCBkZWZhdWx0TW9kYWxEYXRhLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtb2RhbERhdGEubWVzc2FnZSB8fCBkZWZhdWx0TW9kYWxEYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIG9rVGV4dDogbW9kYWxEYXRhLm9rVGV4dCB8fCBkZWZhdWx0TW9kYWxEYXRhLm9rVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgb2tDbGFzczogbW9kYWxEYXRhLm9rQ2xhc3MgfHwgZGVmYXVsdE1vZGFsRGF0YS5va0NsYXNzLFxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxUZXh0OiBtb2RhbERhdGEuY2FuY2VsVGV4dCB8fCBkZWZhdWx0TW9kYWxEYXRhLmNhbmNlbFRleHQsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbENsYXNzOiBtb2RhbERhdGEuY2FuY2VsQ2xhc3MgfHwgZGVmYXVsdE1vZGFsRGF0YS5jYW5jZWxDbGFzc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkucmVzdWx0O1xuICAgIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIExvZ2luU2VydmljZSgkcm9vdFNjb3BlLCAkcSwgJGh0dHAsICRjYWNoZUZhY3RvcnksIGxvY2FsU3RvcmFnZVNlcnZpY2UsIFJFU1RfVVJMX1BSRUZJWCwgTE9HSU5fU1RPUkFHRV9LRVlTLCBFTlYpIHtcblxuICAgIGZ1bmN0aW9uIGxvZ2luKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgICBpZiAoJHJvb3RTY29wZS5pc09ubGluZSB8fCBFTlYgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsTG9naW5TZXJ2aWNlKHVzZXJuYW1lLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChMT0dJTl9TVE9SQUdFX0tFWVMuTE9HR0VEX0lOX0JFRk9SRSwgdXNlcm5hbWUpO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KExPR0lOX1NUT1JBR0VfS0VZUy5BVVRIX1RPS0VOLCByZXNwb25zZS5kYXRhLmlkKTtcblxuICAgICAgICAgICAgICAgIHNldExvZ2dlZEluU3RhdHVzKHJlc3BvbnNlLmRhdGEuaWQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2hlY2tMb2NhbFN0b3JhZ2VJZlVzZXJIYXNCZWVuTG9nZ2VkSW5CZWZvcmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBSRVNUX1VSTF9QUkVGSVggKyAnL2xvZ291dCdcbiAgICAgICAgfSkudGhlbihyZXNldExvZ2dlZEluU3RhdHVzLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgcmVzZXRMb2dnZWRJblN0YXR1cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkcS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja1ByZXNlbnRUb2tlbigpIHtcbiAgICAgICAgdmFyIHhBdXRoVG9rZW4gPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChMT0dJTl9TVE9SQUdFX0tFWVMuQVVUSF9UT0tFTik7XG4gICAgICAgIGlmICh4QXV0aFRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogUkVTVF9VUkxfUFJFRklYICsgJy90b2tlblZhbGlkYXRvcicsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1BVVRILVRPS0VOJzogeEF1dGhUb2tlblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oc2V0TG9nZ2VkSW5TdGF0dXMuYmluZCh1bmRlZmluZWQsIHhBdXRoVG9rZW4pLCByZXNldExvZ2dlZEluU3RhdHVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZXNvbHZlKCkudGhlbihyZXNldExvZ2dlZEluU3RhdHVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxMb2dpblNlcnZpY2UodXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICAgIHZhciBhdXRoID0gYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcblxuICAgICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IFJFU1RfVVJMX1BSRUZJWCArICcvbG9naW4nLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogJ0Jhc2ljICcgKyBhdXRoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrTG9jYWxTdG9yYWdlSWZVc2VySGFzQmVlbkxvZ2dlZEluQmVmb3JlKHVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlU2VydmljZS5nZXQoTE9HSU5fU1RPUkFHRV9LRVlTLkxPR0dFRF9JTl9CRUZPUkUpID09PSB1c2VybmFtZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2xvY2FsVG9rZW4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ29mZmxpbmUnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAnWW91IHNlZW0gdG8gYmUgb2ZmbGluZSBhbmQgY2FuIHRoZXJlZm9yZSBub3QgbG9naW4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldExvZ2dlZEluU3RhdHVzKHhBdXRoVG9rZW4pIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsTG9naW5TdGF0dXMgPSAkcm9vdFNjb3BlLmxvZ2dlZEluO1xuXG4gICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUFVVEgtVE9LRU4nXSA9IHhBdXRoVG9rZW47XG4gICAgICAgICRyb290U2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuXG4gICAgICAgIHJlYWN0T25Mb2dnZWRJblN0YXR1c0NoYW5nZShvcmlnaW5hbExvZ2luU3RhdHVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldExvZ2dlZEluU3RhdHVzKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxMb2dpblN0YXR1cyA9ICRyb290U2NvcGUubG9nZ2VkSW47XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoTE9HSU5fU1RPUkFHRV9LRVlTLkFVVEhfVE9LRU4pO1xuICAgICAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1BVVRILVRPS0VOJ10gPSB1bmRlZmluZWQ7XG4gICAgICAgICRyb290U2NvcGUubG9nZ2VkSW4gPSBmYWxzZTtcblxuICAgICAgICByZWFjdE9uTG9nZ2VkSW5TdGF0dXNDaGFuZ2Uob3JpZ2luYWxMb2dpblN0YXR1cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhY3RPbkxvZ2dlZEluU3RhdHVzQ2hhbmdlKG9yaWdpbmFsTG9naW5TdGF0dXMpIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsTG9naW5TdGF0dXMgIT09ICRyb290U2NvcGUubG9nZ2VkSW4pIHtcbiAgICAgICAgICAgICRjYWNoZUZhY3RvcnkuZ2V0KCckaHR0cCcpLnJlbW92ZUFsbCgpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luU3RhdGVDaGFuZ2VkJywge1xuICAgICAgICAgICAgICAgIGxvZ2dlZEluOiAkcm9vdFNjb3BlLmxvZ2dlZEluXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxvZ2luOiBsb2dpbixcbiAgICAgICAgbG9nb3V0OiBsb2dvdXQsXG4gICAgICAgIGNoZWNrUHJlc2VudFRva2VuOiBjaGVja1ByZXNlbnRUb2tlblxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5TZXJ2aWNlOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbG9naW5SZXNvdXJjZScsIFtcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2NvbmZpZycpLm5hbWVcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cy5jb25maWcoWydsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXInLCBmdW5jdGlvbiAobG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyKSB7XG4gICAgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyXG4gICAgICAgIC5zZXRQcmVmaXgoJ3RyaXBsb2cnKVxuICAgICAgICAuc2V0U3RvcmFnZUNvb2tpZSgwLCAnLycpXG4gICAgICAgIC5zZXRTdG9yYWdlQ29va2llRG9tYWluKCdicm9zLnBpY3MnKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMuZmFjdG9yeSgnTG9naW5TZXJ2aWNlJywgcmVxdWlyZSgnLi9sb2dpbi5zZXJ2aWNlJykpO1xuXG5tb2R1bGUuZXhwb3J0cy5jb25zdGFudCgnTE9HSU5fU1RPUkFHRV9LRVlTJywge1xuICAgIEFVVEhfVE9LRU46ICd4QXV0aFRva2VuJyxcbiAgICBMT0dHRURfSU5fQkVGT1JFOiAnbG9nZ2VkSW5CZWZvcmUnXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gU3RlcHNSZXNvdXJjZSgkcmVzb3VyY2UsIFJFU1RfVVJMX1BSRUZJWCkge1xuXG4gICAgcmV0dXJuICRyZXNvdXJjZShSRVNUX1VSTF9QUkVGSVggKyAnL3RyaXBzLzp0cmlwSWQvc3RlcHMvOnN0ZXBJZCcsIHtcbiAgICAgICAgdHJpcElkOiAnQHRyaXBJZCcsXG4gICAgICAgIHN0ZXBJZDogJ0BzdGVwSWQnXG4gICAgfSwge1xuICAgICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnLCBjYWNoZTogdHJ1ZX0sXG4gICAgICAgIHF1ZXJ5OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZSwgY2FjaGU6IHRydWV9LFxuICAgICAgICB1cGRhdGU6IHttZXRob2Q6ICdQVVQnfVxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBzUmVzb3VyY2U7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBAbmdJbmplY3RcbmZ1bmN0aW9uIFRyaXBzU2VydmljZSgkcm9vdFNjb3BlLCAkcSwgU3RlcHNSZXNvdXJjZSwgbG9jYWxTdG9yYWdlU2VydmljZSwgU1RFUF9TVE9SQUdFX0tFWVMsIEVOVikge1xuXG4gICAgZnVuY3Rpb24gZ2V0U3RlcE9mVHJpcCh0cmlwSWQsIHN0ZXBJZCkge1xuICAgICAgICBpZiAoJHJvb3RTY29wZS5pc09ubGluZSB8fCBFTlYgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgICAgIHJldHVybiBTdGVwc1Jlc291cmNlLmdldCh7dHJpcElkOiB0cmlwSWQsIHN0ZXBJZDogc3RlcElkfSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoc3RlcERhdGEpIHtcbiAgICAgICAgICAgICAgICBzdGVwRGF0YS5mdWxsUXVhbGlmaWVkU3RlcElkID0gc3RlcERhdGEudHJpcElkICsgJy8nICsgc3RlcERhdGEuc3RlcElkO1xuICAgICAgICAgICAgICAgIHNhdmVTdGVwSW5Mb2NhbFN0b3JhZ2Uoc3RlcERhdGEpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXBEYXRhO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSByZWFkU3RlcEZyb21Mb2NhbFN0b3JhZ2UodHJpcElkLCBzdGVwSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJ1N0ZXAgY291bGQgbm90IGJlIGZldGNoZWQgZnJvbSBzZXJ2ZXIgYW5kIGlzIG5vdCBjYWNoZWQgbG9jYWxseS4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSByZWFkU3RlcEZyb21Mb2NhbFN0b3JhZ2UodHJpcElkLCBzdGVwSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RlcCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ29mZmxpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogJ1lvdSBzZWVtIHRvIGJlIG9mZmxpbmUgYW5kIHN0ZXAgeW91IHdhbnQgdG8gdmlzaXQgaXMgbm90IHlldCBzdG9yZWQgbG9jYWxseS4uLiA6KCdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlU3RlcEluTG9jYWxTdG9yYWdlKHN0ZXBEYXRhKSB7XG4gICAgICAgIHZhciBhbGxTdG9yZWRTdGVwcyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KFNURVBfU1RPUkFHRV9LRVlTLkFMTF9TVEVQUykgfHwge307XG5cbiAgICAgICAgaWYgKCFhbGxTdG9yZWRTdGVwc1tzdGVwRGF0YS50cmlwSWRdKSB7XG4gICAgICAgICAgICBhbGxTdG9yZWRTdGVwc1tzdGVwRGF0YS50cmlwSWRdID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBhbGxTdG9yZWRTdGVwc1tzdGVwRGF0YS50cmlwSWRdW3N0ZXBEYXRhLnN0ZXBJZF0gPSBzdGVwRGF0YTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChTVEVQX1NUT1JBR0VfS0VZUy5BTExfU1RFUFMsIGFsbFN0b3JlZFN0ZXBzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkU3RlcEZyb21Mb2NhbFN0b3JhZ2UodHJpcElkLCBzdGVwSWQpIHtcbiAgICAgICAgdmFyIGFsbFN0b3JlZFN0ZXBzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoU1RFUF9TVE9SQUdFX0tFWVMuQUxMX1NURVBTKTtcbiAgICAgICAgcmV0dXJuIGFsbFN0b3JlZFN0ZXBzICYmIGFsbFN0b3JlZFN0ZXBzW3RyaXBJZF0gJiYgYWxsU3RvcmVkU3RlcHNbdHJpcElkXVtzdGVwSWRdID8gYWxsU3RvcmVkU3RlcHNbdHJpcElkXVtzdGVwSWRdIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0ZXBPZlRyaXA6IGdldFN0ZXBPZlRyaXBcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBzU2VydmljZTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3N0ZXBzUmVzb3VyY2UnLCBbXG4gICAgJ25nUmVzb3VyY2UnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvY29uZmlnJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmNvbmZpZyhbJ2xvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcicsIGZ1bmN0aW9uIChsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIpIHtcbiAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXJcbiAgICAgICAgLnNldFByZWZpeCgndHJpcGxvZycpXG4gICAgICAgIC5zZXRTdG9yYWdlQ29va2llKDAsICcvJylcbiAgICAgICAgLnNldFN0b3JhZ2VDb29raWVEb21haW4oJ2Jyb3MucGljcycpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cy5mYWN0b3J5KCdTdGVwc1NlcnZpY2UnLCByZXF1aXJlKCcuL3N0ZXBzLnNlcnZpY2UnKSk7XG5tb2R1bGUuZXhwb3J0cy5mYWN0b3J5KCdTdGVwc1Jlc291cmNlJywgcmVxdWlyZSgnLi9zdGVwcy5yZXNvdXJjZScpKTtcblxubW9kdWxlLmV4cG9ydHMuY29uc3RhbnQoJ1NURVBfU1RPUkFHRV9LRVlTJywge1xuICAgIEFMTF9TVEVQUzogJ2FsbC1zdGVwcydcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBUcmlwc1Jlc291cmNlKCRyZXNvdXJjZSwgUkVTVF9VUkxfUFJFRklYKSB7XG5cbiAgICByZXR1cm4gJHJlc291cmNlKFJFU1RfVVJMX1BSRUZJWCArICcvdHJpcHMvOnRyaXBJZCcsIHtcbiAgICAgICAgdHJpcElkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgY2FjaGU6IHRydWV9LFxuICAgICAgICBxdWVyeToge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IHRydWUsIGNhY2hlOiB0cnVlfSxcbiAgICAgICAgdXBkYXRlOiB7bWV0aG9kOiAnUFVUJ31cbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmlwc1Jlc291cmNlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBUcmlwc1NlcnZpY2UoJHJvb3RTY29wZSwgJHEsICRmaWx0ZXIsICRjYWNoZUZhY3RvcnksIFRyaXBzUmVzb3VyY2UsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIFRSSVBfU1RPUkFHRV9LRVlTKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRUcmlwczogZ2V0VHJpcHMsXG4gICAgICAgIGdldFRyaXA6IGdldFRyaXAsXG4gICAgICAgIHVwZGF0ZVRyaXA6IHVwZGF0ZVRyaXAsXG4gICAgICAgIGRlbGV0ZVRyaXA6IGRlbGV0ZVRyaXBcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0VHJpcHMoKSB7XG4gICAgICAgIGlmICgkcm9vdFNjb3BlLmlzT25saW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gVHJpcHNSZXNvdXJjZS5xdWVyeSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHRyaXBEYXRhKSB7XG4gICAgICAgICAgICAgICAgc29ydEJ5UHJvcGVydHlEZXNjZW5kaW5nKHRyaXBEYXRhLCAndHJpcERhdGUnKTtcblxuICAgICAgICAgICAgICAgIHRyaXBEYXRhLmZvckVhY2goZnVuY3Rpb24gKHRyaXApIHtcbiAgICAgICAgICAgICAgICAgICAgdHJpcC5kaXNwbGF5TmFtZSA9IHRyaXAudHJpcE5hbWUgKyAnICcgKyAkZmlsdGVyKCdkYXRlJykodHJpcC50cmlwRGF0ZSwgJ3l5eXknKTtcbiAgICAgICAgICAgICAgICAgICAgc29ydEJ5UHJvcGVydHlEZXNjZW5kaW5nKHRyaXAuc3RlcHMsICdmcm9tRGF0ZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJHJvb3RTY29wZS5sb2dnZWRJbiA/IFRSSVBfU1RPUkFHRV9LRVlTLkFMTF9UUklQU19BRE1JTiA6IFRSSVBfU1RPUkFHRV9LRVlTLkFMTF9UUklQUywgdHJpcERhdGEpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyaXBEYXRhO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlZFRyaXBzID0gZ2V0VHJpcHNGcm9tTG9jYWxTdG9yYWdlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3JlZFRyaXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZWRUcmlwcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICdUcmlwcyBjb3VsZCBub3QgYmUgZmV0Y2hlZCBmcm9tIHNlcnZlciBhbmQgdGhlcmUgYXJlIG5vIGxvY2FsbHkgY2FjaGVkIHRyaXBzLidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmVkVHJpcHMgPSBnZXRUcmlwc0Zyb21Mb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmVkVHJpcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdG9yZWRUcmlwcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ29mZmxpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogJ1lvdSBzZWVtIHRvIGJlIG9mZmxpbmUgYW5kIHRoZXJlIGFyZSBubyBzdG9yZWQgdHJpcHMgdG8gc2hvdy4uLiA6KCdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUcmlwKHRyaXBJZCkge1xuICAgICAgICByZXR1cm4gZ2V0VHJpcHMoKS50aGVuKGZ1bmN0aW9uIChhbGxUcmlwcykge1xuICAgICAgICAgICAgdmFyIHRyaXAgPSBnZXRUcmlwV2l0aElkKHRyaXBJZCwgYWxsVHJpcHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJpcCA/IHRyaXAgOiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgICAgICAgIGRhdGE6ICdUcmlwIHdpdGggSUQgJyArIHRyaXBJZCArICcgY291bGQgbm90IGJlIGZvdW5kLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVUcmlwKHRyaXApIHtcbiAgICAgICAgaWYgKCRyb290U2NvcGUuaXNPbmxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBUcmlwc1Jlc291cmNlLnVwZGF0ZSh7dHJpcElkOiB0cmlwLnRyaXBJZH0sIHRyaXApLiRwcm9taXNlLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gJ1RyaXAgJyArIHRyaXAudHJpcE5hbWUgKyAnIGNvdWxkIG5vdCBiZSB1cGRhdGVkLic7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAnXFxuRXJyb3IgTWVzc2FnZTogXCInICsgZXJyb3IuZGF0YSArICdcIic7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtc2dcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyaXBJbkxvY2FsU3RvcmFnZSh0cmlwKTtcbiAgICAgICAgICAgIHJldHVybiBzYXZlVHJpcFRvQmVVcGRhdGVkKHRyaXAsIHtcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdvZmZsaW5lJyxcbiAgICAgICAgICAgICAgICBkYXRhOiAnWW91IHNlZW0gdG8gYmUgb2ZmbGluZS4gVGhlcmVmb3JlIHRoZSB0cmlwICcgKyB0cmlwLnRyaXBOYW1lICsgJyBjb3VsZCBvbmx5IGJlIHVwZGF0ZWQgbG9jYWxseS4gSXQgd2lsbCBiZSB1cGRhdGVkIG9uIHRoZSBzZXJ2ZXIgYXMgc29vbiBhcyB5b3UgaGF2ZSBhbiBpbnRlcm5ldCBjb25uZWN0aW9uJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxldGVUcmlwKHRyaXBJZCkge1xuICAgICAgICBpZiAoJHJvb3RTY29wZS5pc09ubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFRyaXBzUmVzb3VyY2UuZGVsZXRlKHt0cmlwSWQ6IHRyaXBJZH0pLiRwcm9taXNlLnRoZW4oZGVsZXRlVHJpcEZyb21Mb2NhbFN0b3JhZ2UuYmluZCh1bmRlZmluZWQsIHRyaXBJZCksIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciAmJiBlcnJvci5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogJ1RyaXAgd2l0aCBJRCAnICsgdHJpcElkICsgJyBjb3VsZCBub3QgYmUgZm91bmQuJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2F2ZVRyaXBUb0JlRGVsZXRlZCh0cmlwSWQsIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAnVHJpcCB3aXRoIElEICcgKyB0cmlwSWQgKyAnIGNvdWxkIG5vdCBiZSBkZWxldGVkIGF0IHRoZSBtb21lbnQuIEhvd2V2ZXIgaXQgaXMgbWFya2VkIHRvIGJlIGRlbGV0ZWQgaW4gdGhlIGZ1dHVyZS4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzYXZlVHJpcFRvQmVEZWxldGVkKHRyaXBJZCwge1xuICAgICAgICAgICAgICAgIHN0YXR1czogJ29mZmxpbmUnLFxuICAgICAgICAgICAgICAgIGRhdGE6ICdZb3Ugc2VlbSB0byBiZSBvZmZsaW5lLiBUaGVyZWZvcmUgdGhlIHRyaXAgd2l0aCB0aGUgSUQgJyArIHRyaXBJZCArICcgY291bGQgb25seSBiZSBkZWxldGVkIGxvY2FsbHkuIEl0IHdpbGwgYmUgZGVsZXRlZCBvbiB0aGUgc2VydmVyIGFzIHNvb24gYXMgeW91IGhhdmUgYW4gaW50ZXJuZXQgY29ubmVjdGlvbidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogUHJpdmF0ZSBmdW5jdGlvbnMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBmdW5jdGlvbiBzb3J0QnlQcm9wZXJ0eURlc2NlbmRpbmcoYXJyLCBwcm9wZXJ0eSkge1xuICAgICAgICBhcnIuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgaWYgKGFbcHJvcGVydHldID4gYltwcm9wZXJ0eV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhW3Byb3BlcnR5XSA8IGJbcHJvcGVydHldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUcmlwc0Zyb21Mb2NhbFN0b3JhZ2UoKSB7XG4gICAgICAgIHZhciBzdG9yZWRUcmlwcztcbiAgICAgICAgaWYgKCRyb290U2NvcGUubG9nZ2VkSW4pIHtcbiAgICAgICAgICAgIHN0b3JlZFRyaXBzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoVFJJUF9TVE9SQUdFX0tFWVMuQUxMX1RSSVBTX0FETUlOKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RvcmVkVHJpcHMgfHwgc3RvcmVkVHJpcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzdG9yZWRUcmlwcyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KFRSSVBfU1RPUkFHRV9LRVlTLkFMTF9UUklQUyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RvcmVkVHJpcHMgJiYgc3RvcmVkVHJpcHMubGVuZ3RoID4gMCA/IHN0b3JlZFRyaXBzIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRyaXBXaXRoSWQodHJpcElkLCBhbGxUcmlwcykge1xuICAgICAgICB2YXIgdHJpcHNXaXRoR2l2ZW5JZCA9IGFsbFRyaXBzLmZpbHRlcihmdW5jdGlvbiAodHJpcCkge1xuICAgICAgICAgICAgcmV0dXJuIHRyaXAudHJpcElkID09PSB0cmlwSWQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0cmlwc1dpdGhHaXZlbklkLmxlbmd0aCA+IDAgPyB0cmlwc1dpdGhHaXZlbklkWzBdIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyaXBJbkxvY2FsU3RvcmFnZSh0cmlwKSB7XG4gICAgICAgIGRlbGV0ZVRyaXBGcm9tTG9jYWxTdG9yYWdlKHRyaXAudHJpcElkKTtcblxuICAgICAgICBmdW5jdGlvbiBhZGRUcmlwVG9Mb2NhbFN0b3JhZ2VXaXRoS2V5KHRyaXAsIGxvY2FsU3RvcmFnZUtleSkge1xuICAgICAgICAgICAgdmFyIHN0b3JlZFRyaXBzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQobG9jYWxTdG9yYWdlS2V5KTtcbiAgICAgICAgICAgIGlmICghc3RvcmVkVHJpcHMpIHtcbiAgICAgICAgICAgICAgICBzdG9yZWRUcmlwcyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdG9yZWRUcmlwcy5wdXNoKHRyaXApO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQobG9jYWxTdG9yYWdlS2V5LCBzdG9yZWRUcmlwcyk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRUcmlwVG9Mb2NhbFN0b3JhZ2VXaXRoS2V5KHRyaXAsIFRSSVBfU1RPUkFHRV9LRVlTLkFMTF9UUklQU19BRE1JTik7XG5cbiAgICAgICAgY2xlYXJDYWNoZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGV0ZVRyaXBGcm9tTG9jYWxTdG9yYWdlKHRyaXBJZCkge1xuICAgICAgICBmdW5jdGlvbiBkZWxldGVUcmlwRnJvbUxvY2FsU3RvcmFnZVdpdGhLZXkodHJpcElkLCBsb2NhbFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZWRUcmlwcyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KGxvY2FsU3RvcmFnZUtleSk7XG5cbiAgICAgICAgICAgIGlmIChzdG9yZWRUcmlwcykge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KGxvY2FsU3RvcmFnZUtleSwgc3RvcmVkVHJpcHMuZmlsdGVyKGZ1bmN0aW9uICh0cmlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmlwLnRyaXBJZCAhPT0gdHJpcElkO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGV0ZVRyaXBGcm9tTG9jYWxTdG9yYWdlV2l0aEtleSh0cmlwSWQsIFRSSVBfU1RPUkFHRV9LRVlTLkFMTF9UUklQU19BRE1JTik7XG5cbiAgICAgICAgY2xlYXJDYWNoZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVUcmlwVG9CZVVwZGF0ZWQodHJpcCwgaW5mbykge1xuICAgICAgICB2YXIgdHJpcHNUb1VwZGF0ZSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KFRSSVBfU1RPUkFHRV9LRVlTLlRSSVBTX1RPX1VQREFURSk7XG5cbiAgICAgICAgaWYgKCF0cmlwc1RvVXBkYXRlKSB7XG4gICAgICAgICAgICB0cmlwc1RvVXBkYXRlID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0cmlwc1RvVXBkYXRlLnB1c2godHJpcCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KFRSSVBfU1RPUkFHRV9LRVlTLlRSSVBTX1RPX1VQREFURSwgdHJpcHNUb1VwZGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuICRxLnJlc29sdmUoaW5mbyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZVRyaXBUb0JlRGVsZXRlZCh0cmlwSWQsIGluZm8pIHtcbiAgICAgICAgdmFyIHRyaXBzVG9EZWxldGUgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChUUklQX1NUT1JBR0VfS0VZUy5UUklQU19UT19ERUxFVEUpO1xuXG4gICAgICAgIGlmICghdHJpcHNUb0RlbGV0ZSkge1xuICAgICAgICAgICAgdHJpcHNUb0RlbGV0ZSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJpcHNUb0RlbGV0ZS5wdXNoKHRyaXBJZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KFRSSVBfU1RPUkFHRV9LRVlTLlRSSVBTX1RPX0RFTEVURSwgdHJpcHNUb0RlbGV0ZSk7XG5cbiAgICAgICAgcmV0dXJuICRxLnJlc29sdmUoaW5mbyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgJGNhY2hlRmFjdG9yeS5nZXQoJyRodHRwJykucmVtb3ZlQWxsKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBzU2VydmljZTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3RyaXBzUmVzb3VyY2UnLCBbXG4gICAgJ25nUmVzb3VyY2UnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvY29uZmlnJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmNvbmZpZyhbJ2xvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcicsIGZ1bmN0aW9uIChsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIpIHtcbiAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXJcbiAgICAgICAgLnNldFByZWZpeCgndHJpcGxvZycpXG4gICAgICAgIC5zZXRTdG9yYWdlQ29va2llKDAsICcvJylcbiAgICAgICAgLnNldFN0b3JhZ2VDb29raWVEb21haW4oJ2Jyb3MucGljcycpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cy5mYWN0b3J5KCdUcmlwc1NlcnZpY2UnLCByZXF1aXJlKCcuL3RyaXBzLnNlcnZpY2UnKSk7XG5tb2R1bGUuZXhwb3J0cy5mYWN0b3J5KCdUcmlwc1Jlc291cmNlJywgcmVxdWlyZSgnLi90cmlwcy5yZXNvdXJjZScpKTtcblxubW9kdWxlLmV4cG9ydHMuY29uc3RhbnQoJ1RSSVBfU1RPUkFHRV9LRVlTJywge1xuICAgIEFMTF9UUklQUzogJ2FsbC10cmlwcycsXG4gICAgQUxMX1RSSVBTX0FETUlOOiAnYWxsLXRyaXBzLWFkbWluJyxcbiAgICBUUklQU19UT19VUERBVEU6ICd0cmlwcy10by11cGRhdGUnLFxuICAgIFRSSVBTX1RPX0RFTEVURTogJ3RyaXBzLXRvLWRlbGV0ZSdcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyaXBsb2dBcHAgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ0FwcCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAnbmdBbmltYXRlJyxcbiAgICAnbmdUb3VjaCcsXG4gICAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICAgJ2FuZ3VsYXItZ29vZ2xlLWFuYWx5dGljcycsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9sb2FkaW5nU3Bpbm5lcicpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy93ZWxjb21lJykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2NvbnRlbnQnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvdHJpcHNSZXNvdXJjZScpLm5hbWUsXG4gICAgcmVxdWlyZSgnbW9kdWxlcy9zdGVwc1Jlc291cmNlJykubmFtZSxcbiAgICByZXF1aXJlKCdtb2R1bGVzL2xvZ2luUmVzb3VyY2UnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvZXJyb3InKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvYWxlcnQnKS5uYW1lLFxuICAgIHJlcXVpcmUoJ21vZHVsZXMvY29uZmlnJykubmFtZVxuXSk7XG5cbnRyaXBsb2dBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCBBbmFseXRpY3NQcm92aWRlciwgR09PR0xFX0FOQUxZVElDU19UUkFDS0lOR19DT0RFKSB7XG5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICB2YXIgbG9jYWxTdG9yYWdlU2VydmljZSA9ICRpbmplY3Rvci5nZXQoJ2xvY2FsU3RvcmFnZVNlcnZpY2UnKSxcbiAgICAgICAgICAgICRzdGF0ZSA9ICRpbmplY3Rvci5nZXQoJyRzdGF0ZScpLFxuICAgICAgICAgICAgbGFzdFN0YXRlID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ2xhc3RTdGF0ZScpO1xuXG4gICAgICAgIGlmIChsYXN0U3RhdGUpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbyhsYXN0U3RhdGUuc3RhdGUubmFtZSwgbGFzdFN0YXRlLnBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3dlbGNvbWUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3dlbGNvbWUnKTtcblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnd2VsY29tZScsIHtcbiAgICAgICAgICAgIHVybDogJy93ZWxjb21lJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiByZXF1aXJlKCcuL3dlbGNvbWUvd2VsY29tZS50cGwuaHRtbCcpLm5hbWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgcGFnZVRpdGxlOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvblNlbGVjdG9yQ2xhc3M6ICd3ZWxjb21lLXRyYW5zaXRpb24nXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY29udGVudCcsIHtcbiAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHJlcXVpcmUoJy4vY29udGVudC9jb250ZW50LnRwbC5odG1sJykubmFtZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4vY29udGVudC9jb250ZW50LmNvbnRyb2xsZXInKSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2NvbnRlbnQnLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25TZWxlY3RvckNsYXNzOiAnY29udGVudC10cmFuc2l0aW9uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGVja0xvZ2luQmVmb3JlOiBmdW5jdGlvbihMb2dpblNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5jaGVja1ByZXNlbnRUb2tlbigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdHJpcHM6IGZ1bmN0aW9uIChjaGVja0xvZ2luQmVmb3JlLCBUcmlwc1NlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyaXBzU2VydmljZS5nZXRUcmlwcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250ZW50LmFsbFRyaXBzJywge1xuICAgICAgICAgICAgdXJsOiAnL3RyaXBzJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiByZXF1aXJlKCcuL2NvbnRlbnQvdHJpcC90cmlwT3ZlcnZpZXcudHBsLmh0bWwnKS5uYW1lLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHBhZ2VUaXRsZTogJ1RyaXAgT3ZlcnZpZXcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY29udGVudC5zdGVwT3ZlcnZpZXcnLCB7XG4gICAgICAgICAgICB1cmw6ICcvdHJpcHMvOnRyaXBJZD9lZGl0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiByZXF1aXJlKCcuL2NvbnRlbnQvc3RlcE92ZXJ2aWV3L3N0ZXBPdmVydmlldy50cGwuaHRtbCcpLm5hbWUsXG4gICAgICAgICAgICBjb250cm9sbGVyOiByZXF1aXJlKCcuL2NvbnRlbnQvc3RlcE92ZXJ2aWV3L3N0ZXBPdmVydmlldy5jb250cm9sbGVyJyksXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzdGVwT3ZlcnZpZXcnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIHRyaXA6IGZ1bmN0aW9uIChjaGVja0xvZ2luQmVmb3JlLCBUcmlwc1NlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJpcHNTZXJ2aWNlLmdldFRyaXAoJHN0YXRlUGFyYW1zLnRyaXBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRlbnQuc3RlcE9mVHJpcCcsIHtcbiAgICAgICAgICAgIHVybDogJy90cmlwcy86dHJpcElkLzpzdGVwSWQnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHJlcXVpcmUoJy4vY29udGVudC9zdGVwRGV0YWlsL3N0ZXBEZXRhaWwudHBsLmh0bWwnKS5uYW1lLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHBhZ2VUaXRsZTogJ1N0ZXAnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udHJvbGxlcjogcmVxdWlyZSgnLi9jb250ZW50L3N0ZXBEZXRhaWwvc3RlcERldGFpbC5jb250cm9sbGVyJyksXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzdGVwRGV0YWlsJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbiAoY2hlY2tMb2dpbkJlZm9yZSwgU3RlcHNTZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0ZXBzU2VydmljZS5nZXRTdGVwT2ZUcmlwKCRzdGF0ZVBhcmFtcy50cmlwSWQsICRzdGF0ZVBhcmFtcy5zdGVwSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250ZW50LmxvZ2luJywge1xuICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiByZXF1aXJlKCcuL2NvbnRlbnQvbG9naW4vbG9naW4udHBsLmh0bWwnKS5uYW1lLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHBhZ2VUaXRsZTogJ0xvZ2luJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4vY29udGVudC9sb2dpbi9sb2dpbi5jb250cm9sbGVyJyksXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdsb2dpbidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250ZW50Lm5vdEZvdW5kJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHJlcXVpcmUoJy4vY29udGVudC9lcnJvci9ub3RGb3VuZC50cGwuaHRtbCcpLm5hbWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgcGFnZVRpdGxlOiAnTm90IGZvdW5kJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIEFuYWx5dGljc1Byb3ZpZGVyLnNldEFjY291bnQoR09PR0xFX0FOQUxZVElDU19UUkFDS0lOR19DT0RFKTtcbiAgICBBbmFseXRpY3NQcm92aWRlci5zdGFydE9mZmxpbmUodHJ1ZSk7XG4gICAgQW5hbHl0aWNzUHJvdmlkZXIuc2V0UGFnZUV2ZW50KCckc3RhdGVDaGFuZ2VTdWNjZXNzJyk7XG59KTtcblxudHJpcGxvZ0FwcC5ydW4oWyckcm9vdFNjb3BlJywgJyRzdGF0ZScsICckc3RhdGVQYXJhbXMnLCAnJHRpbWVvdXQnLCAnJGRvY3VtZW50JywgJyR3aW5kb3cnLCAnbG9jYWxTdG9yYWdlU2VydmljZScsICdBbmFseXRpY3MnLCAnQWxlcnRTZXJ2aWNlJywgJ0VOVicsXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHRpbWVvdXQsICRkb2N1bWVudCwgJHdpbmRvdywgbG9jYWxTdG9yYWdlU2VydmljZSwgQW5hbHl0aWNzLCBBbGVydFNlcnZpY2UsIEVOVikge1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmFsZXJ0cyA9IFtdO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzT25saW5lID0gJHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lIHx8IEVOViA9PT0gJ2xvY2FsJztcblxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuaXNPbmxpbmUgJiYgRU5WICE9PSAnbG9jYWwnKSB7XG4gICAgICAgICAgICAgICAgQW5hbHl0aWNzLm9mZmxpbmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIEFuYWx5dGljcy5jcmVhdGVBbmFseXRpY3NTY3JpcHRUYWcoKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnNjcmlwdFRhZ0NyZWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRU5WICE9PSAnbG9jYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmlzT25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBBbmFseXRpY3Mub2ZmbGluZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChFTlYgIT09ICdsb2NhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNPbmxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgQW5hbHl0aWNzLm9mZmxpbmUoZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISRyb290U2NvcGUuc2NyaXB0VGFnQ3JlYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFuYWx5dGljcy5jcmVhdGVBbmFseXRpY3NTY3JpcHRUYWcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnNjcmlwdFRhZ0NyZWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSkge1xuICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgQW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgIGlmICh0b1N0YXRlLm5hbWUgPT09ICd3ZWxjb21lJyB8fCBmcm9tU3RhdGUubmFtZSA9PT0gJ3dlbGNvbWUnKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuYW5pbWF0aW9uQ2xhc3MgPSAnd2VsY29tZS1hbmltYXRpb24nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuYW5pbWF0aW9uQ2xhc3MgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgLy8gU2Nyb2xsIHRvIHRvcCBvZiBjb250ZW50IGNvbnRhaW5lciBhZnRlciBzdGF0ZSBjaGFuZ2VcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudENvbnRhaW5lciA9ICRkb2N1bWVudFswXS5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1jb250YWluZXInKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudENvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Q29udGFpbmVyLnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSBjdXJyZW50IHN0YXRlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICBmcm9tUGFyYW1zLnJlZmVycmVyU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdG9QYXJhbXMucmVmZXJyZXJTdGF0ZSA9IHtzdGF0ZTogZnJvbVN0YXRlLCBwYXJhbXM6IGZyb21QYXJhbXN9O1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJ2xhc3RTdGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHRvU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogdG9QYXJhbXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5oaWRlU3RhcnRTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VFcnJvcicsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcywgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTdGF0ZSBDaGFuZ2UgRXJyb3I6JywgZXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlcnJvci5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLmluZm8oJ09vcHMsIHRoZXJlIHdhcyBhIHByb2JsZW0gbG9hZGluZyB0aGUgZGF0YS4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnY29udGVudC5ub3RGb3VuZCcsIHt9LCB7cmVzZXQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTZXJ2aWNlLmluZm8oZXJyb3IuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1dXG4pOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBUcmlwbG9nR2FsbGVyeUNvbnRyb2xsZXIoJHJvb3RTY29wZSwgTGlnaHRib3gpIHtcblxuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5waWN0dXJlcy5zb3J0KGJ5Q2FwdHVyZURhdGUpO1xuXG4gICAgdm0uc2hvd0Z1bGxQaWN0dXJlID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIExpZ2h0Ym94Lm9wZW5Nb2RhbCh2bS5waWN0dXJlcywgaW5kZXgpO1xuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLiRvbigndHJpcGxvZ09wZW5QaWN0dXJlJywgZnVuY3Rpb24gKGUsIHBpY3R1cmVOYW1lKSB7XG4gICAgICAgIHZhciBwaWN0dXJlSW5kZXggPSBnZXRJbmRleEJ5UGljdHVyZU5hbWUocGljdHVyZU5hbWUpO1xuXG4gICAgICAgIGlmIChwaWN0dXJlSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgTGlnaHRib3gub3Blbk1vZGFsKHZtLnBpY3R1cmVzLCBwaWN0dXJlSW5kZXgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBieUNhcHR1cmVEYXRlKHBpY3R1cmUxLCBwaWN0dXJlMikge1xuICAgICAgICByZXR1cm4gcGljdHVyZTEuY2FwdHVyZURhdGUubG9jYWxlQ29tcGFyZShwaWN0dXJlMi5jYXB0dXJlRGF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SW5kZXhCeVBpY3R1cmVOYW1lKHBpY3R1cmVOYW1lKSB7XG4gICAgICAgIHZhciBwaWN0dXJlSW5kZXggPSAtMTtcblxuICAgICAgICB2bS5waWN0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWN0dXJlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHBpY3R1cmUubmFtZSA9PT0gcGljdHVyZU5hbWUpIHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlSW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBpY3R1cmVJbmRleDtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpcGxvZ0dhbGxlcnlDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVHJpcGxvZ0dhbGxlcnlEaXJlY3RpdmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0cmlwbG9nR2FsbGVyeS50cGwuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBwaWN0dXJlczogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xsZXI6IHJlcXVpcmUoJy4vdHJpcGxvZ0dhbGxlcnkuY29udHJvbGxlcicpLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd0cmlwbG9nR2FsbGVyeScsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBsb2dHYWxsZXJ5RGlyZWN0aXZlOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0cmlwbG9nR2FsbGVyeS5saWdodGJveC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0cmlwbG9nR2FsbGVyeS5saWdodGJveC50cGwuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCJcXG4nICtcbiAgICAnICAgICBuZy1zd2lwZS1sZWZ0PVwiTGlnaHRib3gubmV4dEltYWdlKClcIlxcbicgK1xuICAgICcgICAgIG5nLXN3aXBlLXJpZ2h0PVwiTGlnaHRib3gucHJldkltYWdlKClcIj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwibGlnaHRib3gtaW1hZ2UtY29udGFpbmVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGltZyBsaWdodGJveC1zcmM9XCJ7eyBMaWdodGJveC5pbWFnZVVybCB9fVwiIGFsdD1cIlwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJyb3cgbGlnaHRib3gtaW1hZ2UtbmF2aWdhdGlvblwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTYgY29sLXNtLTMgbGlnaHRib3gtbmF2aWdhdGlvbi1idXR0b24gcHJldlwiIG5nLWNsaWNrPVwiTGlnaHRib3gucHJldkltYWdlKClcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWdodGJveC1uYXZpZ2F0aW9uLWJ1dHRvbi10ZXh0XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLXByZXZcIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtNiBjb2wtc20tMyBjb2wtc20tb2Zmc2V0LTYgbGlnaHRib3gtbmF2aWdhdGlvbi1idXR0b24gbmV4dFwiIG5nLWNsaWNrPVwiTGlnaHRib3gubmV4dEltYWdlKClcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWdodGJveC1uYXZpZ2F0aW9uLWJ1dHRvbi10ZXh0XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLW5leHRcIj48L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCd0cmlwbG9nR2FsbGVyeScsIFtcbiAgICAnYm9vdHN0cmFwTGlnaHRib3gnLFxuXG4gICAgLy8gVGVtcGxhdGUgbW9kdWxlIGRlcGVuZGVuY2llcyAoY3JlYXRlZCB3aXRoIGJyb3dzZXJpZnktbmctaHRtbDJqcylcbiAgICByZXF1aXJlKCcuL3RyaXBsb2dHYWxsZXJ5LnRwbC5odG1sJykubmFtZSxcbiAgICByZXF1aXJlKCcuL3RyaXBsb2dHYWxsZXJ5LmxpZ2h0Ym94LnRwbC5odG1sJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmNvbmZpZyhbJ0xpZ2h0Ym94UHJvdmlkZXInLCBmdW5jdGlvbiAoTGlnaHRib3hQcm92aWRlcikge1xuICAgIExpZ2h0Ym94UHJvdmlkZXIudGVtcGxhdGVVcmwgPSAndHJpcGxvZ0dhbGxlcnkubGlnaHRib3gudHBsLmh0bWwnO1xuXG4gICAgTGlnaHRib3hQcm92aWRlci5jYWxjdWxhdGVNb2RhbERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoZGltZW5zaW9ucykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3dpZHRoJzogZGltZW5zaW9ucy5pbWFnZURpc3BsYXlXaWR0aCArIDMyLFxuICAgICAgICAgICAgJ2hlaWdodCc6ICdhdXRvJ1xuICAgICAgICB9O1xuICAgIH07XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzLmRpcmVjdGl2ZSgndHJpcGxvZ0dhbGxlcnknLCByZXF1aXJlKCcuL3RyaXBsb2dHYWxsZXJ5LmRpcmVjdGl2ZScpKTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ0dhbGxlcnkudHBsLmh0bWwnLCBbXSk7XG5uZ01vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgndHJpcGxvZ0dhbGxlcnkudHBsLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidHJpcGxvZy1nYWxsZXJ5XCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IG5nLXJlcGVhdD1cInBpY3R1cmUgaW4gdHJpcGxvZ0dhbGxlcnkucGljdHVyZXNcIiBjbGFzcz1cImdhbGxlcnktcGljdHVyZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFwne3sgcGljdHVyZS51cmwgfX1cXCcpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgIG5nLWNsaWNrPVwidHJpcGxvZ0dhbGxlcnkuc2hvd0Z1bGxQaWN0dXJlKCRpbmRleClcIj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gVHJpcGxvZ01hcERpcmVjdGl2ZShNQVBfQk9YX0FDQ0VTU19UT0tFTiwgTUFQX0JPWF9TVFlMRSkge1xuXG4gICAgdmFyIHBvbHlsaW5lO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0cmlwbG9nTWFwLnRwbC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGdwc1BvaW50czogJz0nLFxuICAgICAgICAgICAgcGljdHVyZXM6ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIEwubWFwYm94LmFjY2Vzc1Rva2VuID0gTUFQX0JPWF9BQ0NFU1NfVE9LRU47XG4gICAgICAgICAgICB2YXIgbWFwID0gTC5tYXBib3gubWFwKGVsZW1lbnRbMF0sIE1BUF9CT1hfU1RZTEUpO1xuICAgICAgICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG5cbiAgICAgICAgICAgIGFkZEZ1bGxTY3JlZW5Db250cm9sKG1hcCk7XG4gICAgICAgICAgICBhZGRHcHNQb2ludHMobWFwLCBzY29wZS5ncHNQb2ludHMpO1xuICAgICAgICAgICAgYWRkUGljdHVyZXMobWFwLCBzY29wZS5waWN0dXJlcywgc2NvcGUpO1xuXG4gICAgICAgICAgICB2YXIgY292ZXJlZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY292ZXJlZERpc3RhbmNlJywgY292ZXJlZERpc3RhbmNlLmRpc3RhbmNlICsgJyAnICsgY292ZXJlZERpc3RhbmNlLnVuaXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgZnVuY3Rpb24gY2FsY0Rpc3RhbmNlKCkge1xuICAgICAgICB2YXIgbGF0bG5ncyA9IHBvbHlsaW5lLl9sYXRsbmdzLFxuICAgICAgICAgICAgY292ZXJlZERpc3RhbmNlID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxhdGxuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvdmVyZWREaXN0YW5jZSArPSBsYXRsbmdzW2kgLSAxXS5kaXN0YW5jZVRvKGxhdGxuZ3NbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdmVyZWREaXN0YW5jZSA+PSAxMDAwMCkge1xuICAgICAgICAgICAgLy8gU2hvdyBkaXN0YW5jZSBpbiBrbVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogTWF0aC5yb3VuZChjb3ZlcmVkRGlzdGFuY2UgLyAxMDApIC8gMTAsXG4gICAgICAgICAgICAgICAgdW5pdDogJ2ttJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNob3cgZGlzdGFuY2UgaW4gbVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogTWF0aC5yb3VuZChjb3ZlcmVkRGlzdGFuY2UgKiAxMCkgLyAxMCxcbiAgICAgICAgICAgICAgICB1bml0OiAnbSdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbmx5RGlzcGxheWFibGVQaWN0dXJlcyhwaWN0dXJlKSB7XG4gICAgICAgIHJldHVybiBwaWN0dXJlLmxvY2F0aW9uICYmIHBpY3R1cmUubG9jYXRpb24ubG5nICYmIHBpY3R1cmUubG9jYXRpb24ubGF0ICYmIHBpY3R1cmUud2lkdGggJiYgcGljdHVyZS5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGljdHVyZVRvR2VvSnNvbihwaWN0dXJlKSB7XG4gICAgICAgIHZhciBpY29uU2l6ZSA9IGNhbGN1bGF0ZUljb25TaXplKHBpY3R1cmUpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtwaWN0dXJlLmxvY2F0aW9uLmxuZywgcGljdHVyZS5sb2NhdGlvbi5sYXRdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBwaWN0dXJlLmNhcHRpb24sXG4gICAgICAgICAgICAgICAgcGljdHVyZU5hbWU6IHBpY3R1cmUubmFtZSxcbiAgICAgICAgICAgICAgICBpY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGljb25Vcmw6IHBpY3R1cmUudXJsLFxuICAgICAgICAgICAgICAgICAgICBpY29uU2l6ZTogaWNvblNpemUsXG4gICAgICAgICAgICAgICAgICAgIGljb25BbmNob3I6IFtpY29uU2l6ZVswXSAvIDIsIGljb25TaXplWzFdIC8gMl0sXG4gICAgICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiBbMCwgaWNvblNpemVbMV0gLyAyICogLTFdLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdwaWN0dXJlLW1hcmtlcidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlSWNvblNpemUocGljdHVyZSkge1xuICAgICAgICB2YXIgbG9uZ0VkZ2UgPSAxNTA7XG5cbiAgICAgICAgaWYgKHBpY3R1cmUud2lkdGggPiBwaWN0dXJlLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIFtsb25nRWRnZSwgcGljdHVyZS5oZWlnaHQgKiAobG9uZ0VkZ2UgLyBwaWN0dXJlLndpZHRoKV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3BpY3R1cmUud2lkdGggKiAobG9uZ0VkZ2UgLyBwaWN0dXJlLmhlaWdodCksIGxvbmdFZGdlXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRHcHNQb2ludHMobWFwLCBncHNQb2ludHMpIHtcbiAgICAgICAgcG9seWxpbmUgPSBMLnBvbHlsaW5lKGdwc1BvaW50cywge2NvbG9yOiAncmVkJ30pLmFkZFRvKG1hcCk7XG4gICAgICAgIG1hcC5maXRCb3VuZHMocG9seWxpbmUuZ2V0Qm91bmRzKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZFBpY3R1cmVzKG1hcCwgcGljdHVyZXMsIHNjb3BlKSB7XG4gICAgICAgIGlmIChwaWN0dXJlcyAmJiBwaWN0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgcGljdHVyZUxheWVyID0gTC5tYXBib3guZmVhdHVyZUxheWVyKCk7XG5cbiAgICAgICAgICAgIHBpY3R1cmVMYXllci5vbignbGF5ZXJhZGQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBlLmxheWVyLFxuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlID0gbWFya2VyLmZlYXR1cmU7XG5cbiAgICAgICAgICAgICAgICBtYXJrZXIuc2V0SWNvbihMLmljb24oZmVhdHVyZS5wcm9wZXJ0aWVzLmljb24pKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwaWN0dXJlTGF5ZXIuc2V0R2VvSlNPTihwaWN0dXJlcy5maWx0ZXIob25seURpc3BsYXlhYmxlUGljdHVyZXMpLm1hcChwaWN0dXJlVG9HZW9Kc29uKSk7XG5cbiAgICAgICAgICAgIHZhciBjbHVzdGVyR3JvdXAgPSBuZXcgTC5NYXJrZXJDbHVzdGVyR3JvdXAoKTtcbiAgICAgICAgICAgIHBpY3R1cmVMYXllci5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XG4gICAgICAgICAgICAgICAgY2x1c3Rlckdyb3VwLmFkZExheWVyKGxheWVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWFwLmFkZExheWVyKGNsdXN0ZXJHcm91cCk7XG5cbiAgICAgICAgICAgIHBpY3R1cmVMYXllci5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoJ3RyaXBsb2dPcGVuUGljdHVyZScsIGUubGF5ZXIuZmVhdHVyZS5wcm9wZXJ0aWVzLnBpY3R1cmVOYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkRnVsbFNjcmVlbkNvbnRyb2wobWFwKSB7XG4gICAgICAgIEwuY29udHJvbC5mdWxsc2NyZWVuKCkuYWRkVG8obWFwKTtcblxuICAgICAgICBtYXAub24oJ2VudGVyRnVsbHNjcmVlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZW5hYmxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1hcC5vbignZXhpdEZ1bGxzY3JlZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBsb2dNYXBEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCd0cmlwbG9nTWFwJywgW1xuICAgIHJlcXVpcmUoJ21vZHVsZXMvY29uZmlnJykubmFtZSxcblxuICAgIC8vIFRlbXBsYXRlIG1vZHVsZSBkZXBlbmRlbmNpZXMgKGNyZWF0ZWQgd2l0aCBicm93c2VyaWZ5LW5nLWh0bWwyanMpXG4gICAgcmVxdWlyZSgnLi90cmlwbG9nTWFwLnRwbC5odG1sJykubmFtZVxuXSk7XG5cbm1vZHVsZS5leHBvcnRzLmRpcmVjdGl2ZSgndHJpcGxvZ01hcCcsIHJlcXVpcmUoJy4vdHJpcGxvZ01hcC5kaXJlY3RpdmUnKSk7IiwidmFyIG5nTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RyaXBsb2dNYXAudHBsLmh0bWwnLCBbXSk7XG5uZ01vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgndHJpcGxvZ01hcC50cGwuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ0cmlwbG9nLW1hcC1jb250YWluZXJcIj48L2Rpdj4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gVHJpcGxvZ1RpbGUoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RyaXBsb2dUaWxlLnRwbC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHRpbGVUaXRsZTogJ0AnLFxuICAgICAgICAgICAgcGljdHVyZTogJ0AnXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBsb2dUaWxlOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ1RpbGUnLCBbXG5cbiAgICAvLyBUZW1wbGF0ZSBtb2R1bGUgZGVwZW5kZW5jaWVzIChjcmVhdGVkIHdpdGggYnJvd3NlcmlmeS1uZy1odG1sMmpzKVxuICAgIHJlcXVpcmUoJy4vdHJpcGxvZ1RpbGVCb3gudHBsLmh0bWwnKS5uYW1lLFxuICAgIHJlcXVpcmUoJy4vdHJpcGxvZ1RpbGUudHBsLmh0bWwnKS5uYW1lXG5dKTtcblxubW9kdWxlLmV4cG9ydHMuZGlyZWN0aXZlKCd0cmlwbG9nVGlsZUJveCcsIHJlcXVpcmUoJy4vdHJpcGxvZ1RpbGVCb3guZGlyZWN0aXZlJykpO1xubW9kdWxlLmV4cG9ydHMuZGlyZWN0aXZlKCd0cmlwbG9nVGlsZScsIHJlcXVpcmUoJy4vdHJpcGxvZ1RpbGUuZGlyZWN0aXZlJykpOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0cmlwbG9nVGlsZS50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0cmlwbG9nVGlsZS50cGwuaHRtbCcsXG4gICAgJzxhcnRpY2xlIGNsYXNzPVwidHJpcGxvZy10aWxlXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IG5nLWlmPVwicGljdHVyZVwiIGNsYXNzPVwiY292ZXItcGljdHVyZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcJ3t7IHBpY3R1cmUgfX1cXCcpXCI+PC9kaXY+XFxuJyArXG4gICAgJyAgICA8aDI+e3t0aWxlVGl0bGV9fTwvaDI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidHJpcGxvZy1sZWFkXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG4nICtcbiAgICAnPC9hcnRpY2xlPicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBUcmlwbG9nVGlsZUJveCgpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndHJpcGxvZ1RpbGVCb3gudHBsLmh0bWwnLFxuICAgICAgICBzY29wZTogZmFsc2VcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBsb2dUaWxlQm94OyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0cmlwbG9nVGlsZUJveC50cGwuaHRtbCcsIFtdKTtcbm5nTW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0cmlwbG9nVGlsZUJveC50cGwuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ0cmlwbG9nLXRpbGUtYm94XCIgbmctdHJhbnNjbHVkZT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gQG5nSW5qZWN0XG5mdW5jdGlvbiBUcmlwbG9nVGltZWxpbmUoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RyaXBsb2dUaW1lbGluZS50cGwuaHRtbCcsXG4gICAgICAgIHNjb3BlOiBmYWxzZVxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpcGxvZ1RpbWVsaW5lOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ1RpbWVsaW5lJywgW1xuXG4gICAgLy8gVGVtcGxhdGUgbW9kdWxlIGRlcGVuZGVuY2llcyAoY3JlYXRlZCB3aXRoIGJyb3dzZXJpZnktbmctaHRtbDJqcylcbiAgICByZXF1aXJlKCcuL3RyaXBsb2dUaW1lbGluZS50cGwuaHRtbCcpLm5hbWUsXG4gICAgcmVxdWlyZSgnLi90cmlwbG9nVGltZWxpbmVNb21lbnQudHBsLmh0bWwnKS5uYW1lXG5dKTtcblxubW9kdWxlLmV4cG9ydHMuZGlyZWN0aXZlKCd0cmlwbG9nVGltZWxpbmUnLCByZXF1aXJlKCcuL3RyaXBsb2dUaW1lbGluZS5kaXJlY3RpdmUuanMnKSk7XG5tb2R1bGUuZXhwb3J0cy5kaXJlY3RpdmUoJ3RyaXBsb2dUaW1lbGluZU1vbWVudCcsIHJlcXVpcmUoJy4vdHJpcGxvZ1RpbWVsaW5lTW9tZW50LmRpcmVjdGl2ZS5qcycpKTsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ1RpbWVsaW5lLnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RyaXBsb2dUaW1lbGluZS50cGwuaHRtbCcsXG4gICAgJzx1bCBjbGFzcz1cInRyaXBsb2ctdGltZWxpbmVcIiBuZy10cmFuc2NsdWRlPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPC91bD4nKTtcbn1dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZ01vZHVsZTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIEBuZ0luamVjdFxuZnVuY3Rpb24gVHJpcGxvZ1RpbWVsaW5lTW9tZW50KCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZTogJ15UcmlwbG9nVGltZWxpbmUnLFxuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RyaXBsb2dUaW1lbGluZU1vbWVudC50cGwuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtb21lbnRUaXRsZTogJ0AnLFxuICAgICAgICAgICAgcGljdHVyZTogJ0AnLFxuICAgICAgICAgICAgZnJvbURhdGU6ICdAJyxcbiAgICAgICAgICAgIHRvRGF0ZTogJ0AnLFxuICAgICAgICAgICAgdW5yZWFkRmxhZzogJz0nLFxuICAgICAgICAgICAgbW9tZW50U3JlZjogJ0AnXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXBsb2dUaW1lbGluZU1vbWVudDsiLCJ2YXIgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndHJpcGxvZ1RpbWVsaW5lTW9tZW50LnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RyaXBsb2dUaW1lbGluZU1vbWVudC50cGwuaHRtbCcsXG4gICAgJzxsaT5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1iYWRnZVwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lLXBhbmVsXCIgdWktc3JlZj1cInt7IG1vbWVudFNyZWYgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IG5nLWlmPVwicGljdHVyZVwiIGNsYXNzPVwidGltZWxpbmUtcGljdHVyZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKHt7IHBpY3R1cmUgfX0pO1wiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgbmctaWY9XCJ1bnJlYWRGbGFnXCIgY2xhc3M9XCJ0aW1lbGluZS11bnJlYWQtZmxhZ1wiPlVucmVhZDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1oZWFkaW5nXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS10aXRsZVwiPnt7IG1vbWVudFRpdGxlIH19PC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxwIGNsYXNzPVwidGltZWxpbmUtZGF0ZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGk+PC9pPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCJmcm9tRGF0ZSAhPT0gdG9EYXRlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhdm9pZC13cmFwXCI+e3sgZnJvbURhdGUgfCBkYXRlOlxcJ2Z1bGxEYXRlXFwnfX0gJm5kYXNoOzwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImF2b2lkLXdyYXBcIj57eyB0b0RhdGUgfCBkYXRlOlxcJ2Z1bGxEYXRlXFwnfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cImZyb21EYXRlID09PSB0b0RhdGVcIj57eyBmcm9tRGF0ZSB8IGRhdGU6XFwnZnVsbERhdGVcXCd9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9wPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lbGluZS1ib2R5XCIgbmctdHJhbnNjbHVkZT5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2xpPicpO1xufV0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5nTW9kdWxlOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnd2VsY29tZScsIFtcbiAgICAvLyBUZW1wbGF0ZSBtb2R1bGUgZGVwZW5kZW5jaWVzIChjcmVhdGVkIHdpdGggYnJvd3NlcmlmeS1uZy1odG1sMmpzKVxuICAgIHJlcXVpcmUoJy4vd2VsY29tZS50cGwuaHRtbCcpLm5hbWVcbl0pOyIsInZhciBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd3ZWxjb21lLnRwbC5odG1sJywgW10pO1xubmdNb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dlbGNvbWUudHBsLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGFnZSB3ZWxjb21lLXBhZ2VcIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJiYWNrZ3JvdW5kLWltYWdlXCI+PC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZWxsXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8aDEgY2xhc3M9XCJxdW90ZVwiPiZsYXF1bztUaGUgd29ybGQgaXMgYSBib29rLCBhbmQgdGhvc2Ugd2hvIGRvIG5vdCB0cmF2ZWwgcmVhZCBvbmx5IGEgcGFnZS4mcmFxdW87PC9oMT5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImF1dGhvclwiPlNhaW50IEF1Z3VzdGluZTwvaDM+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImJ1dHRvblwiPlxcbicgK1xuICAgICcgICAgICAgIDxhIHVpLXNyZWY9XCJjb250ZW50LmFsbFRyaXBzXCIgY2xhc3M9XCJidG4tZ2xvd1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICBCZSBwYXJ0IG9mIHRoZSBhZHZlbnR1cmVcXG4nICtcbiAgICAnICAgICAgICA8L2E+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmdNb2R1bGU7Il19
