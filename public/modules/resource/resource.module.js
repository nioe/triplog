'use strict';

module.exports = angular.module('resource', [
    'ngResource',
    require('../config/config.module').name
]);

module.exports.factory('TripResource', require('./trip.resource'));