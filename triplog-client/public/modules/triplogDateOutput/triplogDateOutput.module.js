'use strict';

module.exports = angular.module('triplogDateOutput', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./dateLine.tpl.html'),
    require('./timestamps.tpl.html')
]);

module.exports.directive('dateLine', require('./dateLine.directive'));
module.exports.directive('timestamps', require('./timestamps.directive'));