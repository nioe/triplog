'use strict';

module.exports = angular.module('triplogTimeline', [

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogTimeline.tpl.html'),
    require('./triplogTimelineMoment.tpl.html')
]);

module.exports.directive('triplogTimeline', require('./triplogTimeline.directive.js'));
module.exports.directive('triplogTimelineMoment', require('./triplogTimelineMoment.directive.js'));