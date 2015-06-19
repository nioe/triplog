'use strict';

// @ngInject
function StepOverviewController($state, $stateParams) {
    var vm = this;

    vm.tripId = $stateParams.tripId;
    $state.current.data.pageTitle = 'Trip ' + $stateParams.tripId;
}

module.exports = StepOverviewController;