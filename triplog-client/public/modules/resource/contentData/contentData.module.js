'use strict';

module.exports = angular.module('contentData', [
    'ngResource',
    require('modules/resources').name,
    require('modules/config').name,
    require('modules/processQueue').name,
    require('modules/localData').name
]);

module.exports.factory('TripsService', require('./trips.service'));
module.exports.factory('StepsService', require('./steps.service'));
