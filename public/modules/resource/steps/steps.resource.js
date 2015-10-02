'use strict';

// @ngInject
function StepsResource($resource, REST_URL_PREFIX) {

    return $resource(REST_URL_PREFIX + '/trips/:tripId/steps/:stepId', {
        tripId: '@tripId',
        stepId: '@stepId'
    }, {
        get: {method: 'GET', cache: true},
        query: {method: 'GET', isArray: true, cache: true},
        update: {method: 'POST'}
    });
}

module.exports = StepsResource;