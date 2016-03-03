'use strict';

module.exports = angular.module('contentData', [
    'ngResource',
    'LocalStorageModule',
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
module.exports.factory('TripsResource', require('./trips.resource'));

module.exports.constant('CONTENT_DATA_STORAGE_KEYS', {
    ALL_TRIPS: 'all-trips',
    ALL_TRIPS_ADMIN: 'all-trips-admin'
});

module.exports.run(['$rootScope', 'TripsService', function($rootScope, TripsService) {
    // Reload trips if changes have been synced
    $rootScope.$on('items-synced', TripsService.fetchTrips);
}]);

