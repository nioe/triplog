'use strict';

module.exports = ProcessQueueService;

// @ngInject
function ProcessQueueService($rootScope, localStorageService, LOCAL_STORAGE_KEYS, EVENT_NAMES) {

    return {
        enqueue: enqueue,
        requeue: requeue,
        dequeue: dequeue,
        remove: remove,
        hasItems: hasItems,
        size: size
    };

    function enqueue(resourceName, method, config, payload) {
        var action = createAction(resourceName, method, config, payload),
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

    function remove(resourceName, method, config, payload) {
        console.log(isSimilarTo(createAction(resourceName, method, config, payload)), loadQueueFromLocalStorage()[0]);

        saveQueueInLocalStorage(deleteSimilarEntries(loadQueueFromLocalStorage(), createAction(resourceName, method, config, payload)));
    }

    function hasItems() {
        return loadQueueFromLocalStorage().length > 0;
    }

    function size() {
        return loadQueueFromLocalStorage().length;
    }

    /*********************************************** Private Functions ***********************************************/

    function createAction(resourceName, method, config, payload) {
        return {
            resourceName: resourceName,
            method: method,
            config: config,
            payload: payload
        };
    }

    function loadQueueFromLocalStorage() {
        return localStorageService.get(LOCAL_STORAGE_KEYS.processQueue) || [];
    }

    function saveQueueInLocalStorage(processQueue) {
        localStorageService.set(LOCAL_STORAGE_KEYS.processQueue, processQueue);
    }

    function deleteSimilarEntries(processQueue, action) {
        return processQueue.filter(function (entry) {
            return !isSimilarTo(entry, action);
        });
    }

    function isSimilarTo(entry1, entry2) {
        return entry1.resourceName === entry2.resourceName &&
            entry1.method === entry2.method && (
                (
                    entry1.config === entry2.config
                ) || (
                    entry1.config && entry2.config &&
                    entry1.config.tripId === entry2.config.tripId &&
                    entry1.config.stepId === entry2.config.stepId
                )
            ) && (
                (
                    entry1.payload === entry2.payload
                ) || (
                    entry1.payload && entry2.payload &&
                    entry1.payload.tripId === entry2.payload.tripId &&
                    entry1.payload.stepId === entry2.payload.stepId
                )
            );
    }
}