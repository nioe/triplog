'use strict';

module.exports = angular.module('loadingSpinner', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./loadingSpinner.tpl.html')
]);

module.exports.directive('loadingSpinner', require('./loadingSpinner.directive'));