'use strict';

module.exports = angular.module('tripsResource', [
    'ngResource',
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('TripsService', require('./trips.service'));
module.exports.factory('TripsResource', require('./trips.resource'));

module.exports.constant('TRIP_STORAGE_KEYS', {
    ALL_TRIPS: 'all-trips',
    ALL_TRIPS_ADMIN: 'all-trips-admin',
    TRIPS_TO_UPDATE: 'trips-to-update',
    TRIPS_TO_DELETE: 'trips-to-delete'
});