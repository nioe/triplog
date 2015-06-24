'use strict';

module.exports = angular.module('triplogGallery', [
    'bootstrapLightbox',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogGallery.tpl.html').name,
    require('./triplogGallery.lightbox.tpl.html').name
]);

module.exports.config(function (LightboxProvider) {
    LightboxProvider.templateUrl = 'triplogGallery.lightbox.tpl.html';
});

module.exports.directive('triplogGallery', require('./triplogGallery.directive'));