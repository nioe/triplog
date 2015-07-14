'use strict';

// @ngInject
function TripsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId', {
        tripId: '@id'
    }, {
        update: {method: 'POST'}
    });
}

module.exports = TripsResource;