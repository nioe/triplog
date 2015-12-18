'use strict';

module.exports = angular.module('stepOverview', [
    require('modules/triplogTimeline').name,
    require('modules/modalMessage').name,
    require('modules/markdownPreview').name,
    require('modules/tripsResource').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepOverview.tpl.html').name,
    require('./stepOverview.view.tpl.html').name,
    require('./stepOverview.edit.tpl.html').name
]);

module.exports.controller('StepOverviewController', require('./stepOverview.controller'));