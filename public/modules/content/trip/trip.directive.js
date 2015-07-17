'use strict';

function TripDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'trip.tpl.html',
        scope: {
            data: '='
        }
    };
}

module.exports = TripDirective;