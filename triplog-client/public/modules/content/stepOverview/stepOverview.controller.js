'use strict';

module.exports = StepOverviewController;

// @ngInject
function StepOverviewController($rootScope, $state, loadTripFromLocalStorage, showModal, TripsService, LocalData, EVENT_NAMES) {
    var vm = this;
    vm.trip = loadTripFromLocalStorage();
    vm.editableTrip = createEditableTrip();
    vm.editMode = $state.params.edit && $rootScope.loggedIn;

    $state.current.data.pageTitle = vm.trip.displayName;

    // Reload trips into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, reloadTrip);

    vm.templateToShow = function () {
        return vm.editMode ? 'stepOverview.edit.tpl.html' : 'stepOverview.view.tpl.html';
    };

    vm.reset = function () {
        vm.editableTrip = createEditableTrip();
    };

    vm.cancelEdit = function () {
        showModal({
            title: 'Cancel editing?',
            message: 'All your changed data will be lost.',
            okText: 'Cancel anyway',
            okClass: 'btn-danger',
            cancelText: 'Continue editing',
            cancelClass: 'btn-primary'
        }).then(function () {
            $state.go('content.stepOverview', {edit: undefined});
        });
    };

    vm.saveTrip = function () {
        TripsService.updateTrip(vm.editableTrip);
        $state.go('content.stepOverview', {edit: undefined});
    };

    vm.isUnread = LocalData.isStepUnread;

    function reloadTrip() {
        vm.trip = loadTripFromLocalStorage();
    }

    function createEditableTrip() {
        var editableTrip = angular.copy(vm.trip);
        editableTrip.tripDate = new Date(vm.trip.tripDate);
        editableTrip.published = vm.trip.published ? new Date(vm.trip.published) : undefined;

        return editableTrip;
    }
}