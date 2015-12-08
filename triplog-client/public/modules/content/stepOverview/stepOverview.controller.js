'use strict';

// @ngInject
function StepOverviewController($rootScope, $state, trip) {
    var vm = this;
    vm.trip = trip;
    vm.editMode = $state.params.edit && $rootScope.loggedIn;

    $state.current.data.pageTitle = vm.trip.displayName;
}

module.exports = StepOverviewController;