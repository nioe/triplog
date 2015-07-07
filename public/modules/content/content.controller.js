'use strict';

// @ngInject
function ContentController($rootScope, $state, $window, ENV, TripResource) {

    var vm = this,
        trips;
    vm.navBarEntries = [];
    vm.environment = ENV;

    vm.navigationIsShown = false;
    vm.isIosFullscreen = $window.navigator.standalone ? true : false;

    TripResource.query().$promise.then(function (tripData) {
        trips = tripData;
        createTripOverviewNavBarEntry();
        createStepOverviewNavBarEntry();
    });

    // React on state changes
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', createStepOverviewNavBarEntry);

    //************************************** Public Functions ***************************************
    vm.toggleNavigation = function () {
        if (vm.navigationIsShown) {
            vm.closeNavigation();
        } else {
            vm.openNavigation();
        }
    };

    vm.closeNavigation = function() {
        if (vm.navigationIsShown) {
            vm.navigationIsShown = false;
        }
    };

    vm.openNavigation = function() {
        if (!vm.navigationIsShown) {
            vm.navigationIsShown = true;
        }
    };

    //************************************** Private Functions **************************************
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
        sortByPropertyDescending(trips, 'tripId');

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

        trips.forEach(function (trip) {
            if (trip.steps && trip.steps.length > 0) {
                entries.push({
                    id: trip.tripId,
                    name: trip.tripName,
                    icon: 'trip',
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: trip.tripId});
                    },
                    active: function () {
                        return ['content.allStepsOfTrip', 'content.stepOfTrip'].indexOf($state.current.name) !== -1 &&
                            $state.params.tripId === trip.tripId;
                    }
                });
            }
        });

        vm.navBarEntries.push({
            id: 'trips',
            name: 'Trips',
            icon: 'trip-overview',
            entries: entries
        });
    }


    function createStepOverviewNavBarEntry() {
        if (['content.allStepsOfTrip', 'content.stepOfTrip'].indexOf($state.current.name) !== -1) {
            var tripId = $state.params.tripId,
                entries = [
                    {
                        id: 'overview',
                        name: 'Overview',
                        icon: 'step-overview',
                        action: function () {
                            $state.go('content.allStepsOfTrip', {tripId: tripId});
                        },
                        divider: true,
                        active: function () {
                            return $state.current.name === 'content.allStepsOfTrip';
                        }
                    }
                ],
                tripIndex = indexOfTripWithId(tripId),
                steps;

            if (tripIndex >= 0) {
                steps = trips[tripIndex].steps;

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

                vm.navBarEntries.push({
                    id: tripId,
                    name: trips[tripIndex].tripName,
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
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].tripId === tripId) {
                return i;
            }
        }

        return -1;
    }
}

module.exports = ContentController;