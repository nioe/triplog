'use strict';

module.exports = angular.module('sync', [
    require('modules/contentData').name,
    require('modules/stepsResource').name,
    require('modules/processQueue').name,
    require('modules/config').name
]);

module.exports.factory('SyncService', require('./sync.service'));

module.exports.run(['$rootScope', '$interval', 'SyncService', 'SYNC_INTERVAL', 'EVENT_NAMES', function ($rootScope, $interval, SyncService, SYNC_INTERVAL, EVENT_NAMES) {
    // Start sync service once client got online again
    $rootScope.$on(EVENT_NAMES.onlineStatusChanged, SyncService.sync);

    // Start sync service once a new item is added to the queue
    $rootScope.$on(EVENT_NAMES.processQueueNewElementEnqueued, SyncService.sync);

    // Start sync service frequently
    $interval(SyncService.sync, SYNC_INTERVAL);
}]);