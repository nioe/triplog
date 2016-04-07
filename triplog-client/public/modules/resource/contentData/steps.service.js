'use strict';

module.exports = TripsService;

// @ngInject
function TripsService($rootScope, $q, $log, $http, ProcessQueue, LocalData, StepsResource, ENV, REST_URL_PREFIX) {

    return {
        ensureStepIsFetched: ensureStepIsFetched,
        fetchStep: fetchStep,
        createStep: createStep,
        updateStep: updateStep,
        deleteStep: deleteStep,
        deletePicture: deletePicture
    };

    function ensureStepIsFetched(tripId, stepId) {
        if (LocalData.stepIsLoaded(tripId, stepId)) {
            fetchStep(tripId, stepId); // Fetch step in background
            return $q.resolve(LocalData.getStep.bind(null, tripId, stepId));
        }

        return fetchStep(tripId, stepId);
    }

    function fetchStep(tripId, stepId) {
        if ($rootScope.isOnline || ENV === 'local') {
            $log.info('Fetching step ' + tripId + '/' + stepId + ' from server.');

            return StepsResource.get({tripId: tripId, stepId: stepId}).$promise.then(
                updateAndResolveStep,
                rejectWithMessage.bind(null, 'Step could not be fetched from server and is not cached locally.')
            );
        } else {
            $log.warn('Offline -> Cannot fetch step ' + tripId + '/' + stepId);
            return rejectWithMessage('You seem to be offline and step you want to visit is not yet stored locally... :(', {status: 'offline'});
        }
    }
    
    function createStep(step) {
        LocalData.addOrReplaceStep(step);
        ProcessQueue.enqueue('StepsResource', 'create', {tripId: step.tripId}, step);
    }

    function updateStep(step) {
        LocalData.addOrReplaceStep(step);

        if (step.onlyLocal) {
            createStep(step);
        } else {
            ProcessQueue.enqueue('StepsResource', 'update', {tripId: step.tripId, stepId: step.stepId}, step);
        }
    }

    function deleteStep(tripId, stepId, onlyLocal) {
        if (onlyLocal) {
            ProcessQueue.remove('StepsResource', 'create', {tripId: tripId}, {tripId: tripId, stepId: stepId});
        } else {
            ProcessQueue.enqueue('StepsResource', 'delete', {tripId: tripId, stepId: stepId});
        }

        LocalData.deleteStep(tripId, stepId);
    }

    function deletePicture(tripId, stepId, pictureId) {
        return $http.delete(REST_URL_PREFIX + '/trips/' + tripId + '/steps/' + stepId + '/pictures/' + pictureId);
    }

    /*********************************************** Private Functions ***********************************************/

    function updateAndResolveStep(step) {
        LocalData.addOrReplaceStep(step);
        return LocalData.getStep.bind(null, step.tripId, step.stepId);
    }

    function rejectWithMessage(message, error) {
        return $q.reject({
            status: error.status,
            data: message
        });
    }
}