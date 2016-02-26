'use strict';

module.exports = angular.module('sync', [
    require('modules/tripsResource').name,
    require('modules/stepsResource').name,
    require('modules/processQueue').name,
    require('modules/config').name
]);

module.exports.factory('SyncService', require('./sync.service'));

module.exports.constant('ITEMS_SYNCED_EVENT', 'items-synced');

module.exports.run(['$rootScope', '$interval', 'SyncService', 'SYNC_INTERVAL', function ($rootScope, $interval, SyncService, SYNC_INTERVAL, PROCESS_QUEUE_PUSH_EVENT) {
    // Start sync service once client got online again
    $rootScope.$on('isOnline', SyncService.sync);

    // Start sync service once a new item is added to the queue
    $rootScope.$on(PROCESS_QUEUE_PUSH_EVENT, SyncService.sync);

    // Start sync service frequently
    $interval(SyncService.sync, SYNC_INTERVAL);
}]);