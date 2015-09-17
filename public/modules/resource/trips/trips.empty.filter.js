'use strict';

// @ngInject
function emptyTripFilter($rootScope) {
    return function (trips) {
        return trips.filter(function (trip) {
            return $rootScope.loggedIn || (trip.steps && trip.steps.length > 0);
        });
    };
}

module.exports = emptyTripFilter;