'use strict';

module.exports = angular.module('login', [
    'ui.router',
    'ui.bootstrap',
    require('modules/loginResource').name,
    require('modules/alert').name,
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./login.tpl.html'),
    require('./loginModal.tpl.html')
]);

module.exports.config(function ($httpProvider) {
    $httpProvider.interceptors.push('unauthorizedHttpInterceptor');
});

module.exports.run(['$rootScope', 'showLoginModal', 'EVENT_NAMES', function ($rootScope, showLoginModal, EVENT_NAMES) {
    $rootScope.$on(EVENT_NAMES.showLoginModal, showLoginModal);
}]);

module.exports.controller('LoginController', require('./login.controller'));
module.exports.factory('unauthorizedHttpInterceptor', require('./unauthorizedHttpInterceptor.fn'));
module.exports.factory('showLoginModal', require('./showLoginModal.fn'));
