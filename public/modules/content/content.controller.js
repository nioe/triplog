'use strict';

// @ngInject
function ContentController($rootScope, $state, $window, ENV, trips, LoginService) {

    var vm = this;
    vm.environment = ENV;
    vm.trips = trips;

    vm.navigationIsShown = false;
    vm.isIosFullscreen = $window.navigator.standalone ? true : false;

    reCreateNavigation();

    // React on state changes
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', createStepOverviewNavBarEntry);
    $rootScope.$on('loginStateChanged', reCreateNavigation);

    //************************************** Public Functions ***************************************
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
        LoginService.logout().then(function () {
            $rootScope.alerts.push({
                msg: 'You have been successfully logged out.',
                type: 'success'
            });
            vm.closeNavigation();
        }, function () {
            $rootScope.alerts.push({
                msg: 'There was an error during the logout process... :( Please try again.',
                type: 'danger'
            });
            vm.closeNavigation();
        });
    };

    //************************************** Private Functions **************************************
    function reCreateNavigation() {
        vm.navBarEntries = [];
        createTripOverviewNavBarEntry();
        createStepOverviewNavBarEntry();
    }

    function stateChangeStart() {
        vm.closeNavigation();
        removeStepOverviewNavBarEntry();
    }

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

    function createTripOverviewNavBarEntry() {
        sortByPropertyDescending(vm.trips, 'tripId');

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
            if (trip.steps && trip.steps.length > 0) {
                entries.push({
                    id: trip.tripId,
                    name: trip.tripName,
                    icon: 'trip',
                    action: function () {
                        $state.go('content.stepOverview', {tripId: trip.tripId});
                    },
                    active: function () {
                        return ['content.stepOverview', 'content.stepOfTrip'].indexOf($state.current.name) !== -1 &&
                            $state.params.tripId === trip.tripId;
                    }
                });
            }
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
                            $state.go('content.stepOverview', {tripId: tripId});
                        },
                        divider: true,
                        active: function () {
                            return $state.current.name === 'content.stepOverview';
                        }
                    }
                ],
                tripIndex = indexOfTripWithId(tripId),
                steps;

            if (tripIndex >= 0) {
                steps = vm.trips[tripIndex].steps;

                sortByPropertyDescending(steps, 'fromDate');

                steps.forEach(function (step) {
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
                    entries.push({
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
                }

                vm.navBarEntries.push({
                    id: tripId,
                    name: vm.trips[tripIndex].tripName,
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
}

module.exports = ContentController;