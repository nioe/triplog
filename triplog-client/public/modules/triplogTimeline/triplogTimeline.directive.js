'use strict';

// @ngInject
function TriplogTimeline() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTimeline.tpl.html',
        scope: false
    };
}

module.exports = TriplogTimeline;