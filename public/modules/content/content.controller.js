'use strict';

// @ngInject
function ContentController($rootScope, $state, $window) {

    var vm = this;
    vm.navBarEntries = [];

    // TODO Get trips from backend and revise to have tripId as key (create new overview service, sorted by trip/step date descending)
    var trips = [
        {
            'tripId': 'africa-2015',
            'tripName': 'Africa 2015',
            'tripDate': 201507,
            'steps': [
                {
                    'stepId': 'kruger-nationalpark',
                    'stepName': 'Kruger Nationalpark',
                    'fromDate': '2015-07-30',
                    'toDate': '2015-08-03',
                    'image': 'http://url.to/image'
                },
                {
                    'stepId': 'victoria-falls',
                    'stepName': 'Victoria Falls',
                    'fromDate': '2015-08-07',
                    'toDate': '2015-08-10',
                    'image': 'http://url.to/image'
                }
            ]
        }, {
            'tripId': 'empty-trip-2015',
            'tripName': 'Empty trip 2015',
            'tripDate': 201509,
            'steps': []
        }, {
            'tripId': 'world-tour-2016',
            'tripName': 'World Tour 2016',
            'tripDate': 201605,
            'steps': [
                {
                    'stepId': 'trans-siberian-railway',
                    'stepName': 'Trans-Siberian Railway',
                    'fromDate': '2016-04-01',
                    'toDate': '2016-04-30',
                    'image': 'http://url.to/image'
                },
                {
                    'stepId': 'japan',
                    'stepName': 'Japan',
                    'fromDate': '2016-05-10',
                    'toDate': '2016-05-27',
                    'image': 'http://url.to/image'
                },
                {
                    'stepId': 'vietnam',
                    'stepName': 'Vietnam',
                    'fromDate': '2016-05-29',
                    'toDate': '2016-06-17',
                    'image': 'http://url.to/image'
                }
            ]
        }
    ];

    vm.navigationIsShown = false;
    vm.isIosFullscreen = $window.navigator.standalone ? true : false;

    createTripOverviewNavBarEntry();
    createStepOverviewNavBarEntry();

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
                action: function () {
                    $state.go('content.allTrips');
                },
                divider: true
            }
        ];

        trips.forEach(function (trip) {
            if (trip.steps && trip.steps.length > 0) {
                entries.push({
                    id: trip.tripId,
                    name: trip.tripName,
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: trip.tripId});
                    }
                });
            }
        });

        vm.navBarEntries.push({
            'id': 'trips',
            'name': 'Trips',
            'entries': entries
        });
    }


    function createStepOverviewNavBarEntry() {
        if (['content.allStepsOfTrip', 'content.stepOfTrip'].indexOf($state.current.name) !== -1) {
            var tripId = $state.params.tripId,
                entries = [
                    {
                        id: 'overview',
                        name: 'Overview',
                        action: function () {
                            $state.go('content.allStepsOfTrip', {tripId: tripId});
                        },
                        divider: true
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
                        action: function () {
                            $state.go('content.stepOfTrip', {tripId: tripId, stepId: step.stepId});
                        }
                    });
                });

                vm.navBarEntries.push({
                    'id': tripId,
                    'name': trips[tripIndex].tripName,
                    'active': true,
                    'entries': entries
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