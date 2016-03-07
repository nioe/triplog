'use strict';

module.exports = SyncService;

// @ngInject
function SyncService($rootScope, $q, TripsResource, StepsResource, ProcessQueue, EVENT_NAMES, $log) {

    var resources = {
            'TripsResource': TripsResource,
            'StepsResource': StepsResource
        },
        syncRunning = false,
        syncedContent;

    return {
        sync: sync
    };

    function sync() {
        if (!syncRunning && $rootScope.isOnline && $rootScope.loggedIn) {
            syncRunning = true;
            syncedContent = {trips: [], steps: []};
            var originalQueueSize = ProcessQueue.size();

            dequeueNextElement().then(function () {
                if (ProcessQueue.size() < originalQueueSize) {
                    $rootScope.$broadcast(EVENT_NAMES.syncServiceItemsSynced, syncedContent);
                }

                syncRunning = false;
            });
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function dequeueNextElement() {
        if (!ProcessQueue.hasItems()) {
            return $q.resolve();
        }

        var action = ProcessQueue.dequeue(),
            func = resources[action.resourceName][action.method];

        return func(action.config, action.payload).$promise
            .then(addToSyncedContent.bind(null, action))
            .then(dequeueNextElement, handleError.bind(null, action));
    }

    function addToSyncedContent(action, response) {
        var tripId = action.config.tripId || action.payload.tripId || response.tripId;

        switch (action.resourceName) {
            case 'TripsResource':
                syncedContent.trips.push({tripId: tripId});
                break;
            case 'StepsResource':
                syncedContent.steps.push({
                    tripId: tripId,
                    stepId: action.config.stepId || action.payload.stepId || response.stepId
                });
                break;
            default:
                $log.warn('Unknown resource ' + action.resourceName);
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
}