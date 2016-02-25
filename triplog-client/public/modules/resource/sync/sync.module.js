'use strict';

module.exports = angular.module('sync', [
    require('modules/tripsResource').name,
    require('modules/stepsResource').name,
    require('modules/processQueue').name,
    require('modules/config').name
]);

module.exports.factory('SyncService', require('./sync.service'));

module.exports.constant('ITEMS_SYNCED_EVENT', 'items-synced');

module.exports.run(['$rootScope', '$interval', 'SyncService', 'SYNC_INTERVAL', function ($rootScope, $interval, SyncService, SYNC_INTERVAL) {
    // Start sync service once client got online again
    $rootScope.$on('isOnline', function (event, isOnline) {
        if (isOnline) {
            SyncService.sync();
        }
    });

    // Start sync service frequently
    $interval(SyncService.sync, SYNC_INTERVAL);
}]);