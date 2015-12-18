'use strict';

// @ngInject
function TripsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId', {
        tripId: '@id'
    }, {
        get: {method: 'GET', cache: true},
        query: {method: 'GET', isArray: true, cache: true},
        update: {method: 'PUT'}
    });
}

module.exports = TripsResource;