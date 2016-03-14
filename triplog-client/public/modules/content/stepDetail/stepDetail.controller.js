'use strict';

module.exports = StepDetailController;

// @ngInject
function StepDetailController($rootScope, $state, loadStepFromLocalStorage, LocalData, showModal, StepsService, EVENT_NAMES) {
    var vm = this;
    vm.step = loadStepFromLocalStorage();
    vm.galleryPictures = vm.step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    $state.current.data.pageTitle = vm.step.stepName;
    LocalData.markStepAsRead(vm.step);

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    // Reload step into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, reloadStep);

    // Edit Step
    vm.editableStep = createEditableStep();
    vm.editMode = $state.params.edit && $rootScope.loggedIn;
    vm.templateToShow = function () {
        return vm.editMode ? 'stepDetail.edit.tpl.html' : 'stepDetail.view.tpl.html';
    };

    vm.reset = function () {
        vm.editableStep = createEditableStep();
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
            $state.go('content.stepOfTrip', {edit: undefined});
        });
    };

    vm.saveStep = function () {
        vm.editableStep.gpsPoints = JSON.parse(vm.editableStep.gpsPoints);

        StepsService.updateStep(vm.editableStep);
        $state.go('content.stepOfTrip', {edit: undefined});
    };

    /************************************** Private Functions **************************************/
    function reloadStep() {
        vm.step = loadStepFromLocalStorage();
    }

    function createEditableStep() {
        var editableStep = angular.copy(vm.step);
        editableStep.fromDate = new Date(vm.step.fromDate);
        editableStep.toDate = new Date(vm.step.toDate);
        editableStep.coverPicture = vm.step.coverPicture.substr(vm.step.coverPicture.lastIndexOf('/') + 1);
        editableStep.gpsPoints = JSON.stringify(vm.step.gpsPoints);
        editableStep.published = vm.step.published ? new Date(vm.step.published) : undefined;

        return editableStep;
    }
}
