'use strict';

// @ngInject
function TriplogGalleryController(Lightbox) {

    var vm = this;

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.pictures, index);
    };
}

module.exports = TriplogGalleryController;