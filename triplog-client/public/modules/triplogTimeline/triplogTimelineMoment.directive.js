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
            momentTitle: '@',
            picture: '@',
            fromDate: '@',
            toDate: '@',
            momentSref: '@'
        }
    };
}

module.exports = TriplogTimelineMoment;