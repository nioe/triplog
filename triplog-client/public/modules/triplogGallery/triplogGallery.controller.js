'use strict';

// @ngInject
function TriplogGalleryController($rootScope, Lightbox) {

    var vm = this;

    vm.pictures.sort(byCaptureDate);

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.pictures, index);
    };

    $rootScope.$on('triplogOpenPicture', function (e, pictureName) {
        var pictureIndex = getIndexByPictureName(pictureName);

        if (pictureIndex >= 0) {
            Lightbox.openModal(vm.pictures, pictureIndex);
        }
    });

    function byCaptureDate(picture1, picture2) {
        return picture1.captureDate.localeCompare(picture2.captureDate);
    }

    function getIndexByPictureName(pictureName) {
        var pictureIndex = -1;

        vm.pictures.forEach(function (picture, index) {
            if (picture.name === pictureName) {
                pictureIndex = index;
            }
        });

        return pictureIndex;
    }
}

module.exports = TriplogGalleryController;