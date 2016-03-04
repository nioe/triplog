'use strict';

module.exports = angular.module('resources', [
    'ngResource',
    require('modules/config').name
]);

module.exports.factory('TripsResource', require('./trips.resource'));
module.exports.factory('StepsResource', require('./steps.resource'));
