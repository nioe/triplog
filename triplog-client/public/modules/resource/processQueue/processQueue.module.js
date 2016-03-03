'use strict';

module.exports = angular.module('processQueue', [
    'LocalStorageModule',
    require('modules/config').name
]);

module.exports.factory('ProcessQueue', require('./processQueue.service'));