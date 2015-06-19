'use strict';

function TriplogGalleryDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogGallery.tpl.html',
        scope: {
            pictures: '='
        }
    };
}

module.exports = TriplogGalleryDirective;