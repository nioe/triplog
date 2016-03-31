'use strict';

module.exports = SyncService;

// @ngInject
function SyncService($rootScope, $q, TripsResource, StepsResource, ProcessQueue, LocalData, $log) {

    var resources = {
            'TripsResource': TripsResource,
            'StepsResource': StepsResource
        },
        syncRunning = false;

    return {
        sync: sync
    };

    function sync() {
        if (!syncRunning && $rootScope.isOnline && $rootScope.loggedIn) {
            syncRunning = true;
            dequeueNextElement().then(function () {
                syncRunning = false;
            });
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function dequeueNextElement() {
        if (!ProcessQueue.hasItems()) {
            return $q.resolve();
        }

        var action = ProcessQueue.dequeue();

        return resources[action.resourceName][action.method](action.config, createCorrectPayload(action)).$promise
            .then(updateLocalStorage.bind(null, action))
            .then(dequeueNextElement, handleError.bind(null, action));
    }

    function updateLocalStorage(action, response) {
        if (response) {
            switch (action.resourceName) {
                case 'TripsResource':
                    if (action.method === 'delete') {
                        LocalData.deleteTrip(action.config.tripId);
                    } else {
                        LocalData.addOrReplaceTrip(response, action.method === 'create' ? action.payload.tripId : undefined);
                    }
                    break;
                case 'StepsResource':
                    if (action.method === 'delete') {
                        LocalData.deleteStep(action.config.tripId, action.config.stepId);
                    } else {
                        LocalData.addOrReplaceStep(response, action.method === 'create' ? action.payload.stepId : undefined);
                    }
                    break;
                default:
                    $log.warn('Unknown resource ' + action.resourceName);
            }
        }
    }

    function handleError(action, error) {
        $log.warn(logMessage(action), error.status);
        ProcessQueue.requeue(action);
    }

    function logMessage(action) {
        return 'Error while syncing: ' + action.resourceName + '.' + action.method + '(' +
            JSON.stringify(action.config) + ', ' +
            JSON.stringify(action.payload) + ');';
    }

    function createCorrectPayload(action) {
        if (!action.payload) {
            return;
        }

        var payload = angular.copy(action.payload);

        if (action.method === 'create') {
            // We need to delete the artificial ids because the service is going to be called with them otherwise
            if (payload.tripId && action.resourceName === 'TripsResource') {
                delete payload.tripId;
            }

            if (payload.stepId) {
                delete payload.stepId;
            }
        }

        return payload;
    }
}