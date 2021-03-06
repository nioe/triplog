'use strict';

module.exports = TripAddController;

// @ngInject
function TripAddController($state, showModal, TripsService) {
    var vm = this;

    vm.newTrip = {
        steps: []
    };

    vm.cancel = function () {
        showModal({
            title: 'Cancel adding trip?',
            message: 'All data you have entered will be lost.',
            okText: 'Cancel anyway',
            okClass: 'btn-danger',
            cancelText: 'Continue',
            cancelClass: 'btn-primary'
        }).then(function () {
            $state.go('content.tripOverview');
        });
    };

    vm.createTrip = function () {
        if (vm.form.$valid) {
            TripsService.createTrip(vm.newTrip);
            $state.go('content.tripOverview');
        }
    };
}