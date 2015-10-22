'use strict';

// @ngInject
function TriplogTimelineMoment() {

    return {
        require: '^TriplogTimeline',
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'triplogTimelineMoment.tpl.html',
        scope: {
            title: '@',
            picture: '@',
            fromDate: '@',
            toDate: '@'
        }
    };
}

module.exports = TriplogTimelineMoment;