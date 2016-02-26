'use strict';

module.exports = angular.module('triplogGallery', [
    'bootstrapLightbox',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogGallery.tpl.html'),
    require('./triplogGallery.lightbox.tpl.html')
]);

module.exports.config(['LightboxProvider', function (LightboxProvider) {
    LightboxProvider.templateUrl = 'triplogGallery.lightbox.tpl.html';

    LightboxProvider.calculateModalDimensions = function (dimensions) {
        return {
            'width': dimensions.imageDisplayWidth + 32,
            'height': 'auto'
        };
    };
}]);

module.exports.directive('triplogGallery', require('./triplogGallery.directive'));