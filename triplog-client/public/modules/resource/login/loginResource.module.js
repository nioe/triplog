'use strict';

module.exports = angular.module('loginResource', [
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('triplog')
        .setStorageCookie(0, '/')
        .setStorageCookieDomain('bros.pics');
}]);

module.exports.factory('LoginService', require('./login.service'));

module.exports.constant('LOGIN_STORAGE_KEYS', {
    AUTH_TOKEN: 'xAuthToken',
    LOGGED_IN_BEFORE: 'loggedInBefore'
});