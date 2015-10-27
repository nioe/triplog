'use strict';

// @ngInject
function TripsService($rootScope, $q, StepsResource, localStorageService, STEP_STORAGE_KEYS, ENV) {

    function getStepOfTrip(tripId, stepId) {
        if ($rootScope.isOnline || ENV === 'local') {
            return StepsResource.get({tripId: tripId, stepId: stepId}).$promise.then(function (stepData) {
                saveStepInLocalStorage(stepData);

                return stepData;
            }, function (error) {
                if (error.status === 0) {
                    var step = readStepFromLocalStorage(tripId, stepId);
                    if (step) {
                        return step;
                    }
                }

                $q.reject(error);
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