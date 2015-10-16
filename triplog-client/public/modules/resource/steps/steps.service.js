'use strict';

// @ngInject
function TripsService($rootScope, $q, StepsResource, localStorageService, STEP_STORAGE_KEYS, ENV) {

    function getStepOfTrip(tripId, stepId) {
        if ($rootScope.isOnline || ENV === 'local') {
            return StepsResource.get({tripId: tripId, stepId: stepId}).$promise.then(function (stepData) {
                storeStepDate(stepData);

                return stepData;
            });
        } else {
            return $q(function (resolve, reject) {
                var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS);
                if (allStoredSteps && allStoredSteps[tripId] && allStoredSteps[tripId][stepId]) {
                    resolve(allStoredSteps[tripId][stepId]);
                } else {
                    reject({
                        status: 'offline',
                        data: 'You seem to be offline and step you want to visit is not yet stored locally... :('
                    });
                }
            });
        }
    }

    function storeStepDate(stepData) {
        var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS) || {};

        if (!allStoredSteps[stepData.tripId]) {
            allStoredSteps[stepData.tripId] = {};
        }

        allStoredSteps[stepData.tripId][stepData.stepId] = stepData;

        localStorageService.set(STEP_STORAGE_KEYS.ALL_STEPS, allStoredSteps);
    }

    return {
        getStepOfTrip: getStepOfTrip
    };
}

module.exports = TripsService;