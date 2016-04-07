'use strict';

// @ngInject
function ContentController($rootScope, $state, $window, ENV, EVENT_NAMES, loadTripsFromLocalStorage, TripsService, StepsService, LoginService, AlertService, showModal, showPictureUploadModal, ProcessQueue) {

    var vm = this;
    vm.environment = ENV;

    vm.navigationIsShown = false;
    vm.isIosFullscreen = $window.navigator.standalone ? true : false;

    loadTripsAndCreateNavigaton();

    // React on state changes
    $rootScope.$on('$stateChangeSuccess', createNavigation);
    $rootScope.$on(EVENT_NAMES.loginStateChanged, createNavigation);

    // Reload trips into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, loadTripsAndCreateNavigaton);

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

    vm.login = function () {
        vm.closeNavigation();
        $state.go('content.login');
    };

    vm.logout = function () {
        vm.closeNavigation();
        LoginService.logout().then(function () {
            $state.go('content.tripOverview', {}, {reload: true});
            AlertService.success('You have been successfully logged out.');
        }, function () {
            AlertService.error('There was an error during the logout process... :( Please try again.');
        });
    };

    vm.shouldShowProcessQueue = function () {
        return $rootScope.loggedIn && ProcessQueue.hasItems();
    };

    vm.itemCountInProcessQueue = function () {
        return ProcessQueue.size();
    };

    vm.openPicture = function (imageName) {
        $rootScope.$broadcast(EVENT_NAMES.triplogOpenPicture, imageName);
    };

    /************************************** Private Functions **************************************/
    function loadTripsAndCreateNavigaton() {
        vm.trips = loadTripsFromLocalStorage();
        createNavigation();
    }

    function createNavigation() {
        vm.navBarEntries = [];
        createTripOverviewNavBarEntry();
        createStepOverviewNavBarEntry();
        createStepDetailNavBarEntry();
        createVisitedCountriesNavBarEntry();
    }

    function createTripOverviewNavBarEntry() {
        var entries = [{
            id: 'overview',
            name: 'Overview',
            icon: 'trip-overview',
            action: function () {
                $state.go('content.tripOverview');
            },
            divider: true,
            active: function () {
                return $state.current.name === 'content.tripOverview';
            }
        }];

        vm.trips.forEach(function (trip) {
            entries.push({
                id: trip.tripId,
                name: trip.displayName,
                icon: 'trip',
                action: function () {
                    $state.go('content.trip', {tripId: trip.tripId});
                },
                active: function () {
                    return ['content.trip', 'content.step'].indexOf($state.current.name) !== -1 &&
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
                    $state.go('content.tripAdd');
                },
                active: function () {
                    return $state.current.name === 'content.tripAdd';
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
        if (['content.trip', 'content.step'].indexOf($state.current.name) !== -1) {
            var tripId = $state.params.tripId,
                entries = [
                    {
                        id: 'overview',
                        name: 'Overview',
                        icon: 'step-overview',
                        action: function () {
                            $state.go('content.trip', {tripId: tripId, edit: undefined});
                        },
                        divider: true,
                        active: function () {
                            return $state.current.name === 'content.trip' && !$state.params.edit;
                        }
                    }
                ],
                tripIndex = indexOfTripWithId(tripId);

            if (tripIndex >= 0) {
                var createStepEntry = function (step) {
                        entries.push({
                            id: step.stepId,
                            name: step.stepName,
                            icon: 'step',
                            action: function () {
                                $state.go('content.step', {tripId: tripId, stepId: step.stepId});
                            },
                            active: function () {
                                return $state.params.tripId === tripId && $state.params.stepId === step.stepId;
                            }
                        });
                    },
                    steps = vm.trips[tripIndex].steps;

                for (var i = 0; i < Math.min(steps.length, 10); i++) {
                    createStepEntry(steps[i]);
                }

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

    function createStepDetailNavBarEntry() {
        var tripId = $state.params.tripId,
            stepId = $state.params.stepId,
            stepIndex = indexOfStepWithId(tripId, stepId);

        if ($rootScope.loggedIn && $state.current.name === 'content.step' && stepIndex >= 0) {
            var step = vm.trips[indexOfTripWithId(tripId)].steps[stepIndex],
                controls = [];

            controls.push({
                id: 'editStep',
                name: 'Edit Step',
                icon: 'edit',
                action: function () {
                    $state.go('content.step', {tripId: tripId, stepId: stepId, edit: true});
                },
                active: function () {
                    return $state.current.name === 'content.step' && $state.params.edit;
                }
            });

            controls.push({
                id: 'deleteStep',
                name: 'Delete Step',
                icon: 'delete',
                action: function () {
                    var deleteStepModalData = {
                        title: 'Delete step "' + step.stepName + '"',
                        message: 'Caution: This cannot be undone. All step data including pictures will be deleted!',
                        okText: 'Delete',
                        okClass: 'btn-danger',
                        cancelText: 'Cancel',
                        cancelClass: 'btn-primary'
                    };

                    showModal(deleteStepModalData).then(function () {
                        $state.go('content.trip', {tripId: tripId});
                        StepsService.deleteStep(tripId, stepId, step.onlyLocal);
                    });
                },
                active: function () {
                    return false;
                }
            });

            controls.push({
                id: 'uploadPictures',
                name: 'Upload Pictures',
                icon: 'camera',
                action: function () {
                    if ($rootScope.isOnline) {
                        showPictureUploadModal(step).then(function () {
                            StepsService.fetchStep(tripId, stepId);
                        });
                    }
                },
                active: function () {
                    return false;
                },
                disabled: function () {
                    return !$rootScope.isOnline;
                }
            });

            vm.navBarEntries.push({
                id: stepId,
                name: step.stepName,
                icon: 'step',
                entries: controls
            });
        }
    }

    function createVisitedCountriesNavBarEntry() {
        vm.navBarEntries.push({
            id: 'visitedCountries',
            name: 'Visited Countries',
            icon: 'visited-countries',
            action: function () {
                if ($rootScope.isOnline) {
                    $state.go('content.visitedCountries');
                }
            },
            active: function () {
                return $state.current.name === 'content.visitedCountries';
            },
            disabled: function () {
                return !$rootScope.isOnline;
            }
        });
    }

    function indexOfTripWithId(tripId) {
        for (var i = 0; i < vm.trips.length; i++) {
            if (vm.trips[i].tripId === tripId) {
                return i;
            }
        }

        return -1;
    }

    function indexOfStepWithId(tripId, stepId) {
        var tripIndex = indexOfTripWithId(tripId);

        if (tripIndex >= 0) {
            var trip = vm.trips[tripIndex];
            for (var i = 0; i < trip.steps.length; i++) {
                if (trip.steps[i].stepId === stepId) {
                    return i;
                }
            }
        }

        return -1;
    }

    function isDeviceWithSideNavigation() {
        return $window.innerWidth < 768;
    }

    function tripControls(tripId) {
        var controls = [],
            trip = vm.trips[indexOfTripWithId(tripId)];

        controls.push({
            id: 'editTrip',
            name: 'Edit Trip',
            icon: 'edit',
            action: function () {
                $state.go('content.trip', {tripId: tripId, edit: true});
            },
            active: function () {
                return $state.current.name === 'content.trip' && $state.params.edit;
            }
        });

        controls.push({
            id: 'deleteTrip',
            name: 'Delete Trip',
            icon: 'delete',
            action: function () {
                var deleteTripModalData = {
                    title: 'Delete trip "' + trip.displayName + '"',
                    message: 'Caution: This cannot be undone. All trip data including all stpes and pictures will be deleted!',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    cancelText: 'Cancel',
                    cancelClass: 'btn-primary'
                };

                showModal(deleteTripModalData).then(function () {
                    $state.go('content.tripOverview');
                    TripsService.deleteTrip(tripId, trip.onlyLocal);
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
                $state.go('content.stepAdd', {tripId: trip.tripId});
            },
            active: function () {
                return $state.current.name === 'content.stepAdd';
            },
            disabled: function () {
                return trip.onlyLocal;
            }
        });

        return controls;
    }
}

module.exports = ContentController;