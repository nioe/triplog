'use strict';

// @ngInject
function StepOverviewController($rootScope, $state, trip, showModal) {
    var vm = this;
    vm.trip = trip;
    vm.editableTrip = createEditableTrip();

    vm.editMode = $state.params.edit && $rootScope.loggedIn;
    vm.tripTextPreview = false;

    $state.current.data.pageTitle = vm.trip.displayName;

    vm.templateToShow = function () {
        return vm.editMode ? 'stepOverview.edit.tpl.html' : 'stepOverview.view.tpl.html';
    };

    vm.toggleTripTextPreview = function () {
        vm.tripTextPreview = !vm.tripTextPreview;
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
        console.log('Save trip');
        $state.go('content.stepOverview', {edit: undefined});
    };

    function createEditableTrip() {
        var editableTrip = angular.copy(trip);
        editableTrip.tripDate = new Date(trip.tripDate);
        editableTrip.published = trip.published ? new Date(trip.published) : undefined;

        return editableTrip;
    }
}

module.exports = StepOverviewController;