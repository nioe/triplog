'use strict';

module.exports = angular.module('stepDetail', [
    // Template module dependencies (created with browserify-ng-html2js)
    require('./stepDetail.tpl.html').name
]);

module.exports.controller('StepDetailController', require('./stepDetail.controller'));