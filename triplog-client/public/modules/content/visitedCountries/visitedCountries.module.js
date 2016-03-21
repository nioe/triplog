'use strict';

module.exports = angular.module('visitedCountries', [
    'googlechart',
    require('modules/config').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./visitedCountries.tpl.html')
]);

module.exports.controller('VisitedCountriesController', require('./visitedCountries.controller'));