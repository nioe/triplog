'use strict';

module.exports = angular.module('triplogPictureUpload', [
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./pictureUpload.tpl.html')
]);

module.exports.directive('pictureUpload', require('./pictureUpload.directive'));