'use strict';

function TriplogGalleryDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogGallery.tpl.html',
        scope: {
            pictures: '&'
        },
        controller: require('./triplogGallery.controller'),
        controllerAs: 'triplogGallery',
        bindToController: true
    };
}

module.exports = TriplogGalleryDirective;