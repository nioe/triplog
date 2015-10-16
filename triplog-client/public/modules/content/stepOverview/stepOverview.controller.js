'use strict';

// @ngInject
function StepOverviewController($state, trip) {
    var vm = this;
    vm.trip = trip;

    $state.current.data.pageTitle = vm.trip.displayName;
}

module.exports = StepOverviewController;