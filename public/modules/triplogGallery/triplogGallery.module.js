'use strict';

module.exports = angular.module('triplogGallery', [
    'bootstrapLightbox',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogGallery.tpl.html').name,
    require('./triplogGallery.lightbox.tpl.html').name
]);

module.exports.config(function (LightboxProvider) {
    LightboxProvider.templateUrl = 'triplogGallery.lightbox.tpl.html';

    LightboxProvider.getImageUrl = function (imageUrl) {
        return imageUrl;
    };

    LightboxProvider.calculateModalDimensions = function (dimensions) {
        var width = dimensions.imageDisplayWidth + 32;

        if (width >= dimensions.windowWidth - 20) {
            width = 'auto';
        }

        return {
            'width': width,
            'height': 'auto'
        };
    };
});

module.exports.directive('triplogGallery', require('./triplogGallery.directive'));