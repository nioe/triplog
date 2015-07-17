'use strict';

module.exports = angular.module('trip', [
    'ui.router',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./tripOverview.tpl.html').name,
    require('./trip.tpl.html').name
]);

module.exports.directive('trip', require('./trip.directive'));