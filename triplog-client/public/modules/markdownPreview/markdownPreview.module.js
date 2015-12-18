'use strict';

module.exports = angular.module('markdownPreview', [
    'hc.marked',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./markdownPreview.tpl.html').name
]);

module.exports.directive('markdownPreview', require('./markdownPreview.directive'));