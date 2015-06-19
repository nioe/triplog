'use strict';

module.exports = angular.module('triplogGallery', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogGallery.tpl.html').name
]);

module.exports.directive('triplogGallery', require('./triplogGallery.directive'));