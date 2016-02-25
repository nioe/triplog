'use strict';

module.exports = angular.module('processQueue', [
    'LocalStorageModule'
]);

module.exports.factory('ProcessQueue', require('./processQueue.service'));

module.exports.constant('PROCESS_QUEUE_STORAGE_KEYS', {
    PROCESS_QUEUE: 'process-queue'
});

module.exports.constant('PROCESS_QUEUE_PUSH_EVENT', 'process-queue-element-pushed');