'use strict';

// @ngInject
function StepOverviewController($rootScope, $state, trip) {
    var vm = this;
    vm.trip = trip;
    vm.editMode = $state.params.edit && $rootScope.loggedIn;

    $state.current.data.pageTitle = vm.trip.displayName;

    vm.templateToShow = function () {
        return vm.editMode ? 'stepOverview.edit.tpl.html' : 'stepOverview.view.tpl.html';
    };

    vm.cancelEdit = function() {
        $state.go('content.stepOverview', {edit: undefined});
    };

    vm.saveTrip = function() {
        console.log('Save trip');
        $state.go('content.stepOverview', {edit: undefined});
    };
}

module.exports = StepOverviewController;