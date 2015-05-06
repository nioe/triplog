'use strict';

// @ngInject
function ContentController($rootScope, $state) {

    var vm = this;
    vm.navbarCollapsed = true;

    vm.navBarEntries = [
        {
            name: 'Trips',
            entries: [
                {
                    name: 'Overview',
                    action: function () {
                        $state.go('content.allTrips');
                    },
                    divider: true
                }, {
                    name: 'Trip 1',
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: '1'});
                    }
                }, {
                    name: 'Trip 2',
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: '2'});
                    }
                }, {
                    name: 'Trip 3',
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: '3'});
                    }
                }
            ]
        }
    ];

    addOrRemoveSpecificTripNavBarEntry();
    $rootScope.$on('$stateChangeSuccess', addOrRemoveSpecificTripNavBarEntry);

    vm.toggleNavBar = function () {
        vm.navbarCollapsed = !vm.navbarCollapsed;
    };

    /* Private Functions */
    function addOrRemoveSpecificTripNavBarEntry() {
        if ($state.current.name === 'content.allStepsOfTrip' || $state.current.name === 'content.stepOfTrip') {
            var tripId = $state.params.tripId;
            vm.navBarEntries[1] = {
                name: 'Trip ' + tripId,
                entries: [{
                    name: 'Overview',
                    action: function () {
                        $state.go('content.allStepsOfTrip', {tripId: tripId});
                    },
                    divider: true
                }, {
                    name: 'Step 1',
                    action: function () {
                        $state.go('content.stepOfTrip', { tripId: '1', stepId: '1' });
                    }
                }, {
                    name: 'Step 2',
                    action: function () {
                        $state.go('content.stepOfTrip', { tripId: '1', stepId: '2' });
                    }
                }]
            };
        } else {
            if (vm.navBarEntries[1]) {
                vm.navBarEntries.pop();
            }
        }
    }
}

module.exports = ContentController;