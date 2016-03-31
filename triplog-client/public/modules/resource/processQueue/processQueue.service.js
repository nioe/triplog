'use strict';

module.exports = ProcessQueueService;

// @ngInject
function ProcessQueueService($rootScope, localStorageService, LOCAL_STORAGE_KEYS, EVENT_NAMES) {

    return {
        enqueue: enqueue,
        requeue: requeue,
        dequeue: dequeue,
        hasItems: hasItems,
        size: size
    };

    function enqueue(resourceName, method, config, payload) {
        var action = {
                resourceName: resourceName,
                method: method,
                config: config,
                payload: payload
            },
            processQueue = deleteSimilarEntries(loadQueueFromLocalStorage(), action);

        processQueue.push(action);
        saveQueueInLocalStorage(processQueue);

        $rootScope.$broadcast(EVENT_NAMES.processQueueNewElementEnqueued);
    }

    function requeue(action) {
        var processQueue = loadQueueFromLocalStorage();
        processQueue.unshift(action);
        saveQueueInLocalStorage(processQueue);
    }

    function dequeue() {
        var processQueue = loadQueueFromLocalStorage(),
            next = processQueue.shift();

        saveQueueInLocalStorage(processQueue);

        return next;
    }

    function hasItems() {
        return loadQueueFromLocalStorage().length > 0;
    }

    function size() {
        return loadQueueFromLocalStorage().length;
    }

    /*********************************************** Private Functions ***********************************************/

    function loadQueueFromLocalStorage() {
        return localStorageService.get(LOCAL_STORAGE_KEYS.processQueue) || [];
    }

    function saveQueueInLocalStorage(processQueue) {
        localStorageService.set(LOCAL_STORAGE_KEYS.processQueue, processQueue);
    }
    
    function deleteSimilarEntries(processQueue, action) {
        return processQueue.filter(function (entry) {
           return !(entry.resourceName === action.resourceName &&
               entry.method === action.method && 
               entry.config === action.config && (
                    entry.payload === undefined || (
                        entry.payload.tripId === action.payload.tripId &&
                        entry.payload.stepId === action.payload.stepId
                    )
               ));
        });
    }
}