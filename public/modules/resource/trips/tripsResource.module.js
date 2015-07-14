'use strict';

module.exports = angular.module('resource', [
    'ngResource',
    'LocalStorageModule',
    require('../../config/config.module').name
]);

module.exports.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
});

module.exports.factory('TripsService', require('./trips.service'));
module.exports.factory('TripsResource', require('./trips.resource'));

module.exports.constant('STORAGE_KEYS', {
    ALL_TRIPS: 'all-trips'
});