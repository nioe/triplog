'use strict';

module.exports = angular.module('trip', [
    'ui.router',
    require('modules/triplogTile').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./tripOverview.tpl.html').name
]);