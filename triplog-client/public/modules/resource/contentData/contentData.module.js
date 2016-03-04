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
module.exports.factory('StepsService', require('./steps.service'));

module.exports.run(['$rootScope', 'TripsService', 'StepsService', 'EVENT_NAMES', function($rootScope, TripsService, StepsService, EVENT_NAMES) {
    // Reload trips and changed steps if changes have been synced
    $rootScope.$on(EVENT_NAMES.syncServiceItemsSynced, function(event, syncedContent) {
        if (syncedContent.trips) {
            TripsService.fetchTrips();
        }

        if (syncedContent.steps) {
            syncedContent.steps.forEach(function (step) {
                StepsService.fetchStep(step.tripId, step.stepId);
            });
        }
    });
}]);

