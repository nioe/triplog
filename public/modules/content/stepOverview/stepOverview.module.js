'use strict';

module.exports = angular.module('stepOverview', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepOverview.tpl.html').name,
]);

module.exports.controller('StepOverviewController', require('./stepOverview.controller'));