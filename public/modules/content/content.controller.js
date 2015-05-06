'use strict';

// @ngInject
function ContentController($state, $stateParams) {

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

    vm.toggleNavBar = function () {
        vm.navbarCollapsed = !vm.navbarCollapsed;
    };
}

module.exports = ContentController;