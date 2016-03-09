'use strict';

// @ngInject
function StepsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId/steps/:stepId', {
        tripId: '@tripId',
        stepId: '@stepId'
    }, {
        get: {method: 'GET', cache: false},
        query: {method: 'GET', isArray: true, cache: false},
        update: {method: 'PUT'},
        create: {method: 'POST'}
    });
}

module.exports = StepsResource;