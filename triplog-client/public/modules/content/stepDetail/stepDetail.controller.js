'use strict';

// @ngInject
function StepDetailController($rootScope, $state, step) {
    var vm = this;
    vm.step = step;
    vm.galleryPictures = step.pictures.filter(function (picture) {
        return picture.shownInGallery;
    });

    $state.current.data.pageTitle = vm.step.stepName;

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };
}

module.exports = StepDetailController;