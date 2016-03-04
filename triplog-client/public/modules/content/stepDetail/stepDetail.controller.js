'use strict';

// @ngInject
function StepDetailController($rootScope, $state, loadStepFromLocalStorage, LOCAL_STORAGE_KEYS, EVENT_NAMES, localStorageService) {
    var vm = this;
    vm.step = loadStepFromLocalStorage();
    vm.galleryPictures = vm.step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    // Reload step into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, loadSteps);

    markStepAsRead();

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    // TODO move to LocalData
    function markStepAsRead() {
        var readSteps = localStorageService.get(LOCAL_STORAGE_KEYS.alreadyReadSteps) || [];
        if (readSteps.indexOf(vm.step.fullQualifiedStepId) === -1) {
            readSteps.push(vm.step.fullQualifiedStepId);
            localStorageService.set(LOCAL_STORAGE_KEYS.alreadyReadSteps, readSteps);
        }
    }

    function loadSteps() {
        vm.step = loadStepFromLocalStorage();
    }
}

module.exports = StepDetailController;