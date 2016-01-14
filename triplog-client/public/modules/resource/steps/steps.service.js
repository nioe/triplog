'use strict';

// @ngInject
function TripsService($rootScope, $q, StepsResource, localStorageService, STEP_STORAGE_KEYS, ENV) {

    function getStepOfTrip(tripId, stepId) {
        if ($rootScope.isOnline || ENV === 'local') {
            return StepsResource.get({tripId: tripId, stepId: stepId}).$promise.then(function (stepData) {
                stepData.fullQualifiedStepId = stepData.tripId + '/' + stepData.stepId;
                saveStepInLocalStorage(stepData);

                return stepData;
            }, function (error) {
                var step = readStepFromLocalStorage(tripId, stepId);
                if (step) {
                    return step;
                }

                return $q.reject({
                    status: error.status,
                    data: 'Step could not be fetched from server and is not cached locally.'
                });
            });
        } else {
            return $q(function (resolve, reject) {
                var step = readStepFromLocalStorage(tripId, stepId);
                if (step) {
                    resolve(step);
                } else {
                    reject({
                        status: 'offline',
                        data: 'You seem to be offline and step you want to visit is not yet stored locally... :('
                    });
                }
            });
        }
    }

    function saveStepInLocalStorage(stepData) {
        var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS) || {};

        if (!allStoredSteps[stepData.tripId]) {
            allStoredSteps[stepData.tripId] = {};
        }

        allStoredSteps[stepData.tripId][stepData.stepId] = stepData;

        localStorageService.set(STEP_STORAGE_KEYS.ALL_STEPS, allStoredSteps);
    }

    function readStepFromLocalStorage(tripId, stepId) {
        var allStoredSteps = localStorageService.get(STEP_STORAGE_KEYS.ALL_STEPS);
        return allStoredSteps && allStoredSteps[tripId] && allStoredSteps[tripId][stepId] ? allStoredSteps[tripId][stepId] : undefined;
    }

    return {
        getStepOfTrip: getStepOfTrip
    };
}

module.exports = TripsService;