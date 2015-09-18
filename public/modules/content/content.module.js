'use strict';

module.exports = angular.module('content', [
    require('modules/trip').name,
    require('modules/stepOverview').name,
    require('modules/stepDetail').name,
    require('modules/login').name,
    require('modules/config').name,
    require('modules/tripsResource').name,
    require('modules/loginResource').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html').name
]);

module.exports.controller('ContentController', require('./content.controller'));