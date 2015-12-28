'use strict';

// @ngInject
function StepDetailController($rootScope, $state, step, CONTENT_STORAGE_KEYS, localStorageService) {
    var vm = this;
    vm.step = step;
    vm.galleryPictures = step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    markStepAsRead();

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    function markStepAsRead() {
        var readSteps = localStorageService.get(CONTENT_STORAGE_KEYS.READ_STEPS) || [];
        if (readSteps.indexOf(step.fullQualifiedStepId) === -1) {
            readSteps.push(step.fullQualifiedStepId);
            localStorageService.set(CONTENT_STORAGE_KEYS.READ_STEPS, readSteps);
        }
    }
}

module.exports = StepDetailController;