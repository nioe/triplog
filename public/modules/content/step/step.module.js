'use strict';

module.exports = angular.module('step', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepOverview.tpl.html').name,
    require('./stepDetail.tpl.html').name
]);