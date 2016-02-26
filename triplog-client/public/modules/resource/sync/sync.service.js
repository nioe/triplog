'use strict';

module.exports = SyncService;

// @ngInject
function SyncService($rootScope, $q, TripsResource, StepsResource, ProcessQueue, ITEMS_SYNCED_EVENT, $log) {

    var resources = {
        'TripsResource': TripsResource,
        'StepsResource': StepsResource
    };

    return {
        sync: sync
    };

    function sync() {
        if ($rootScope.isOnline && $rootScope.loggedIn) {
            var originalQueueSize = ProcessQueue.size();

            dequeueNextElement().then(function () {
                if (ProcessQueue.size() < originalQueueSize) {
                    $rootScope.$broadcast(ITEMS_SYNCED_EVENT);
                }
            });
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function dequeueNextElement() {
        if (!ProcessQueue.hasItems()) {
            return $q.resolve;
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