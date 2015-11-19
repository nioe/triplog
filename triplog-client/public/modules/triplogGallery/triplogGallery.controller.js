'use strict';

// @ngInject
function TriplogGalleryController(Lightbox) {

    var vm = this;

    vm.pictures.sort(byCaptureDate);

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.pictures, index);
    };

    function byCaptureDate(picture1, picture2) {
        return picture1.captureDate.localeCompare(picture2.captureDate);
    }
}

module.exports = TriplogGalleryController;