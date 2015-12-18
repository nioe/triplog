'use strict';

// @ngInject
function StepOverviewController($rootScope, $state, trip, showModal, TripsService, AlertService) {
    var vm = this;
    vm.trip = trip;
    vm.editableTrip = createEditableTrip();

    vm.editMode = $state.params.edit && $rootScope.loggedIn;

    $state.current.data.pageTitle = vm.trip.displayName;

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
        TripsService.updateTrip(createSendableTrip()).then(function () {
            AlertService.success('Trip has been updated.');
            $state.go('content.stepOverview', {edit: undefined}, {reload: true});
        });
    };

    function createEditableTrip() {
        var editableTrip = angular.copy(trip);
        editableTrip.tripDate = new Date(trip.tripDate);
        editableTrip.published = trip.published ? new Date(trip.published) : undefined;

        return editableTrip;
    }

    function createSendableTrip() {
        var sendableTrip = angular.copy(vm.editableTrip);

        delete sendableTrip.displayName;
        sendableTrip.tripDate = vm.editableTrip.tripDate.toJSON().substr(0, 10);
        sendableTrip.published = vm.editableTrip.published ? vm.editableTrip.published.toJSON().substr(0, 19) : undefined;

        return sendableTrip;
    }
}

module.exports = StepOverviewController;