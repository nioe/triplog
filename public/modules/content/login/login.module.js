'use strict';

module.exports = angular.module('login', [
    'ui.router',
    require('modules/loginResource').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./login.tpl.html').name
]);

module.exports.controller('LoginController', require('./login.controller'));