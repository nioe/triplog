'use strict';

// @ngInject
function TriplogGalleryController($scope, Lightbox, EVENT_NAMES) {

    var vm = this;
    
    sortPictures();
    
    $scope.$watch(vm.pictures, sortPictures);

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.sortedPictures, index);
    };

    $scope.$on(EVENT_NAMES.triplogOpenPicture, function (e, pictureName) {
        var pictureIndex = getIndexByPictureName(pictureName);

        if (pictureIndex >= 0) {
            vm.showFullPicture(pictureIndex);
        }
    });
    
    function sortPictures() {
        vm.sortedPictures = vm.pictures().sort(byCaptureDate);
    }

    function byCaptureDate(picture1, picture2) {
        return picture1.captureDate.localeCompare(picture2.captureDate);
    }

    function getIndexByPictureName(pictureName) {
        var pictureIndex = -1;

        vm.sortedPictures.forEach(function (picture, index) {
            if (picture.name === pictureName) {
                pictureIndex = index;
            }
        });

        return pictureIndex;
    }
}

module.exports = TriplogGalleryController;