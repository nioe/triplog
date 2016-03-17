'use strict';

module.exports = angular.module('content', [
    'hc.marked',
    'LocalStorageModule',
    require('modules/trip').name,
    require('modules/stepOverview').name,
    require('modules/stepDetail').name,
    require('modules/login').name,
    require('modules/config').name,
    require('modules/contentData').name,
    require('modules/loginResource').name,
    require('modules/alert').name,
    require('modules/modalMessage').name,
    require('modules/processQueue').name,
    require('modules/triplogPictureUpload').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html')
]);

module.exports.config(['markedProvider', function (markedProvider) {
    markedProvider.setRenderer({
        heading: function (text, level) {
            var subLevel = level + 1;
            return '<h' + subLevel + '>' + text + '</h' + subLevel + '>';
        }
    });
}]);

module.exports.controller('ContentController', require('./content.controller'));