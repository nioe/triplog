'use strict';

module.exports = VisitedCountriesController;

// @ngInject
function VisitedCountriesController() {
    var vm = this;

    vm.geoChart = {};

    vm.geoChart.type = 'GeoChart';
    vm.geoChart.data = [
        ['Locale', 'Count', 'Percent'],
        ['Germany', 22, 23],
        ['United States', 34, 11],
        ['Brazil', 42, 11],
        ['Canada', 57, 32],
        ['France', 6, 9],
        ['RU', 72, 3]
    ];


    vm.geoChart.options = {
        chartArea: {left: 10, top: 10, bottom: 0, height: '100%'},
        colorAxis: {colors: ['#aec7e8', '#1f77b4']},
        displayMode: 'regions',
        backgroundColor: { fill:'transparent' }
    };

    vm.geoChart.formatters = {
        number: [{
            columnNum: 1,
            pattern: '$ #,##0.00'
        }]
    };
}