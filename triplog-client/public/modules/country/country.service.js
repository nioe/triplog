'use strict';

module.exports = CountryService;

// @ngInject
function CountryService() {
    var countries = require('./countries.json');

    return {
        getAllCountries: getAllCountries,
        getCountryNameFor: getCountryNameFor
    };

    function getAllCountries() {
        return angular.copy(countries);
    }

    function getCountryNameFor(isoCode) {
        return countries[isoCode];
    }
}