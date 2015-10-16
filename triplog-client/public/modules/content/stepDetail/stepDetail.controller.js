'use strict';

// @ngInject
function StepDetailController($rootScope, $state, step) {
    var vm = this;
    vm.step = step;

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };
}

module.exports = StepDetailController;