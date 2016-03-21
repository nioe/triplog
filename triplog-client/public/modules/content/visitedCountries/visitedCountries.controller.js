'use strict';

module.exports = VisitedCountriesController;

// @ngInject
function VisitedCountriesController($http, CountryService, REST_URL_PREFIX) {
    var vm = this;

    vm.geoChart = {};

    loadVisitedCoutries().then(reviseVisitedCountries).then(drawChart);

    /************************************** Private Functions **************************************/
    function loadVisitedCoutries() {
        return $http.get(REST_URL_PREFIX + '/visited-countries');
    }

    function reviseVisitedCountries(response) {
        var visitedCountries = response.data.map(function (entry) {
            entry[0] = CountryService.getCountryNameFor(entry[0]);
            return entry;
        });

        visitedCountries.unshift(['Locale', 'Steps which lead through this country']);

        return visitedCountries;
    }

    function drawChart(visitedCountries) {
        vm.geoChart.type = 'GeoChart';
        vm.geoChart.data = visitedCountries;

        vm.geoChart.options = {
            chartArea: {left: 10, top: 10, bottom: 0, height: '100%'},
            colorAxis: {colors: ['#aec7e8', '#1f77b4']},
            displayMode: 'regions',
            backgroundColor: { fill:'transparent' }
        };
    }
}