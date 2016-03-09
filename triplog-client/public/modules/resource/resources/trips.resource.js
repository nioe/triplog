'use strict';

module.exports = TripsResource;

// @ngInject
function TripsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId', {
        tripId: '@tripId'
    }, {
        get: {method: 'GET', cache: false},
        query: {method: 'GET', isArray: true, cache: false},
        update: {method: 'PUT'},
        create: {method: 'POST'}
    });
}
