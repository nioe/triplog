'use strict';

module.exports = angular.module('stepDetail', [
    require('modules/triplogGallery').name,
    require('modules/triplogMap').name,
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepDetail.tpl.html'),
    require('./stepDetail.view.tpl.html'),
    require('./stepDetail.edit.tpl.html'),
    require('./dateLine.tpl.html')
]);

module.exports.controller('StepDetailController', require('./stepDetail.controller'));
module.exports.directive('dateLine', require('./dateLine.directive'));