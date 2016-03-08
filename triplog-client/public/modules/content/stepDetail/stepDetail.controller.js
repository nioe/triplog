'use strict';

// @ngInject
function StepDetailController($rootScope, $state, loadStepFromLocalStorage, LocalData, EVENT_NAMES) {
    var vm = this;
    vm.step = loadStepFromLocalStorage();
    vm.galleryPictures = vm.step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    LocalData.markStepAsRead(vm.step);

    // Reload step into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, loadSteps);

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    function loadSteps() {
        vm.step = loadStepFromLocalStorage();
    }
}

module.exports = StepDetailController;