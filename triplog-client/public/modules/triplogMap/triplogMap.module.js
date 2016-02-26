'use strict';

module.exports = angular.module('triplogMap', [
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogMap.tpl.html')
]);

module.exports.directive('triplogMap', require('./triplogMap.directive'));