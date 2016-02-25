'use strict';

module.exports = angular.module('sync', [
    require('modules/tripsResource').name,
    require('modules/stepsResource').name,
    require('modules/processQueue').name
]);

module.exports.factory('SyncService', require('./sync.service'));

module.exports.constant('ITEMS_SYNCED_EVENT', 'items-synced');