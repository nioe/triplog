'use strict';

module.exports = angular.module('trip', [
    require('modules/triplogTimeline').name,
    require('modules/modalMessage').name,
    require('modules/markdownPreview').name,
    require('modules/contentData').name,
    require('modules/triplogDateOutput').name,
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./trip.tpl.html'),
    require('./trip.view.tpl.html'),
    require('./trip.edit.tpl.html')
]);

module.exports.controller('TripController', require('./trip.controller'));