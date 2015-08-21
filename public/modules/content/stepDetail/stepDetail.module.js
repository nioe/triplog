'use strict';

module.exports = angular.module('stepDetail', [
    require('../../triplogGallery/triplogGallery.module').name,
    require('../../triplogMap/triplogMap.module').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepDetail.tpl.html').name
]);

module.exports.controller('StepDetailController', require('./stepDetail.controller'));