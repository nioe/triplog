'use strict';

module.exports = angular.module('stepsResource', [
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

module.exports.factory('StepsService', require('./steps.service'));
module.exports.factory('StepsResource', require('./steps.resource'));

module.exports.constant('STEP_STORAGE_KEYS', {
    ALL_STEPS: 'all-steps'
});