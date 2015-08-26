'use strict';

module.exports = angular.module('triplogMap', [
    require('../config/config.module').name,
    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogMap.tpl.html').name
]);

module.exports.directive('triplogMap', require('./triplogMap.directive'));