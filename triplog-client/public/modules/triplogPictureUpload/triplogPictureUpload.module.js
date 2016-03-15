'use strict';

module.exports = angular.module('triplogPictureUpload', [
    'ui.bootstrap',
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./pictureUpload.tpl.html'),
    require('./pictureUploadModal.tpl.html')
]);

module.exports.directive('pictureUpload', require('./pictureUpload.directive'));
module.exports.factory('showPictureUploadModal', require('./showPictureUploadModal.fn'));