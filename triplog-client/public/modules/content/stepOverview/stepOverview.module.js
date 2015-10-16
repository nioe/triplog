'use strict';

module.exports = angular.module('stepOverview', [
    require('modules/triplogTile').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepOverview.tpl.html').name
]);

module.exports.controller('StepOverviewController', require('./stepOverview.controller'));