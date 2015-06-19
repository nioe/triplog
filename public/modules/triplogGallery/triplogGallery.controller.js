'use strict';

// @ngInject
function TriplogGalleryController(Lightbox) {

    var vm = this;

    vm.lightboxPictures = [];
    vm.pictures.forEach(function (picture) {
       vm.lightboxPictures.push({
           url: picture
       });
    });

    vm.showFullPicture = function (index) {
        Lightbox.openModal(vm.lightboxPictures, index);
    };
}

module.exports = TriplogGalleryController;