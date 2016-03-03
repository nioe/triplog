'use strict';

module.exports = angular.module('contentData', [
    'ngResource',
    'LocalStorageModule',
    require('modules/resources').name,
    require('modules/config').name,
    require('modules/processQueue').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('LocalData', require('./localData.service'));
module.exports.factory('TripsService', require('./trips.service'));

module.exports.run(['$rootScope', 'TripsService', 'EVENT_NAMES', function($rootScope, TripsService, EVENT_NAMES) {
    // Reload trips if changes have been synced
    $rootScope.$on(EVENT_NAMES.syncServiceItemsSynced, TripsService.fetchTrips);
}]);

