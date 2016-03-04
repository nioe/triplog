'use strict';

module.exports = SyncService;

// @ngInject
function SyncService($rootScope, $q, TripsResource, StepsResource, ProcessQueue, EVENT_NAMES, $log) {

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
            var originalQueueSize = ProcessQueue.size();

            dequeueNextElement().then(function () {
                if (ProcessQueue.size() < originalQueueSize) {
                    // TODO Add synced items to event
                    $rootScope.$broadcast(EVENT_NAMES.syncServiceItemsSynced);
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

        return func(action.config, action.payload).$promise.then(dequeueNextElement, handleError.bind(undefined, action));
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