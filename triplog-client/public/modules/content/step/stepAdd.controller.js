'use strict';

module.exports = StepAddController;

// @ngInject
function StepAddController($state, showModal, StepsService, LocalData, CountryService) {
    var vm = this;
        
    vm.trip = LocalData.getTrip($state.params.tripId);
    vm.newStep = {
        tripId: vm.trip.tripId,
        pictures: [],
        traveledCountries: []
    };

    vm.prettifyGpsPoints = function () {
        var valid = true;
        
        if (vm.newStep.gpsPoints) {
            try {
                vm.newStep.gpsPoints = JSON.stringify(JSON.parse(vm.newStep.gpsPoints), undefined, 4);
            } catch (error) {
               valid = false;
            }
        }

        vm.form.gpsPoints.$setValidity('validJson', valid);
    };

    createSelectableCountries();

    vm.addTraveledCountry = function () {
        vm.newStep.traveledCountries.push(vm.selectedCountry);
        vm.selectedCountry = undefined;
        createSelectableCountries();
    };

    vm.deleteTraveledCountry = function (isoCode) {
        vm.newStep.traveledCountries = vm.newStep.traveledCountries.filter(function (country) {
            return country !== isoCode;
        });
        createSelectableCountries();
    };

    vm.getCountryNameFor = CountryService.getCountryNameFor;

    vm.cancel = function () {
        showModal({
            title: 'Cancel adding step?',
            message: 'All data you have entered will be lost.',
            okText: 'Cancel anyway',
            okClass: 'btn-danger',
            cancelText: 'Continue',
            cancelClass: 'btn-primary'
        }).then(function () {
            $state.go('content.trip', {tripId: vm.trip.tripId});
        });
    };

    vm.createStep = function () {
        if (vm.form.$valid) {
            vm.newStep.gpsPoints = vm.newStep.gpsPoints ? JSON.parse(vm.newStep.gpsPoints) : [];

            StepsService.createStep(vm.newStep);
            $state.go('content.trip', {tripId: vm.trip.tripId});
        }
    };

    /************************************** Private Functions **************************************/
    function createSelectableCountries() {
        vm.selectableCountries = CountryService.getAllCountries();
        vm.newStep.traveledCountries.forEach(function (isoCode) {
            delete vm.selectableCountries[isoCode];
        });
    }
}