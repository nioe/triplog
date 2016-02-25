'use strict';

module.exports = SyncService;

// @ngInject
function SyncService($rootScope, TripsResource, StepsResource, ProcessQueue, ITEMS_SYNCED_EVENT) {

    var resources = {
            'TripsResource': TripsResource,
            'StepsResource': StepsResource
        },
        stopSync;

    return {
        sync: sync
    };

    function sync() {
        stopSync = false;
        var originalQueueSize = ProcessQueue.size();

        while (ProcessQueue.hasItems() && !stopSync) {
            var action = ProcessQueue.dequeue(),
                func = resources[action.resourceName][action.method];

            func(action.config, action.payload).$promise.then(noop, handleError.bind(undefined, action));
        }

        if (ProcessQueue.size() < originalQueueSize) {
            $rootScope.$broadcast(ITEMS_SYNCED_EVENT);
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function noop(data) {
        return data;
    }

    function handleError(action, error) {
        if (error.status !== 404) {
            // If there is another error than 'not found' we enqueue the item again but we break the current sync
            ProcessQueue.enqueue(action.resourceName, action.method, action.config, action.payload);
            stopSync = true;
        }
    }
}