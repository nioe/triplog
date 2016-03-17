'use strict';

module.exports = StepDetailController;

// @ngInject
function StepDetailController($rootScope, $state, loadStepFromLocalStorage, LocalData, showModal, AlertService, StepsService, EVENT_NAMES) {
    var vm = this,
        countries = require('./countries.json');

    reloadStep();
    initEditableStep();

    LocalData.markStepAsRead(vm.step);

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    vm.templateToShow = function () {
        return vm.editMode ? 'stepDetail.edit.tpl.html' : 'stepDetail.view.tpl.html';
    };

    // Reload step into memory if local storage changed
    $rootScope.$on(EVENT_NAMES.localStorageUpdated, reloadStep);


    /************************************** Private Functions **************************************/
    function reloadStep() {
        vm.step = loadStepFromLocalStorage();
        vm.galleryPictures = vm.step.pictures.filter(function (picture) {
            return picture.shownInGallery;
        });
        $state.current.data.pageTitle = vm.step.stepName;
    }

    function initEditableStep() {
        vm.editableStep = createEditableStep();
        vm.editMode = $state.params.edit && $rootScope.loggedIn;
        vm.selectedCountry = undefined;

        createSelectableCountries();

        vm.addTraveledCountry = function () {
            vm.editableStep.traveledCountries.push(vm.selectedCountry);
            vm.selectedCountry = undefined;
            createSelectableCountries();
        };

        vm.deleteTraveledCountry = function (isoCode) {
            vm.editableStep.traveledCountries = vm.editableStep.traveledCountries.filter(function (country) {
                return country !== isoCode;
            });
            createSelectableCountries();
        };

        vm.getCountryNameFor = function (isoCode) {
            return countries[isoCode];
        };

        vm.reset = function () {
            vm.editableStep = createEditableStep();
        };

        vm.cancelEdit = function () {
            showModal({
                title: 'Cancel editing?',
                message: 'All your changed data will be lost.',
                okText: 'Cancel anyway',
                okClass: 'btn-danger',
                cancelText: 'Continue editing',
                cancelClass: 'btn-primary'
            }).then(function () {
                $state.go('content.stepOfTrip', {edit: undefined});
            });
        };

        vm.saveStep = function () {
            vm.editableStep.gpsPoints = JSON.parse(vm.editableStep.gpsPoints);

            StepsService.updateStep(vm.editableStep);
            $state.go('content.stepOfTrip', {edit: undefined});
        };

        vm.showPictureDeleteButton = function () {
            return $rootScope.isOnline;
        };

        vm.deletePicture = function (pictureId) {
            showModal({
                title: 'Delete picture',
                message: 'Do you really want to delete this picture?',
                okText: 'Delete',
                okClass: 'btn-danger',
                cancelText: 'Cancel',
                cancelClass: 'btn-primary'
            }).then(function () {
                StepsService.deletePicture(vm.step.tripId, vm.step.stepId, pictureId).then(
                    function () {
                        vm.editableStep.pictures = vm.editableStep.pictures.filter(function (picture) {
                            return picture.name !== pictureId;
                        });

                        AlertService.info('Picture has been deleted.');
                        StepsService.fetchStep(vm.step.tripId, vm.step.stepId);
                    }, function (error) {
                        switch (error.status) {
                            case -1:
                                AlertService.error('Backend not available. Picture could not have been deleted...');
                                break;
                            case 0:
                                AlertService.error('You seem to be offline. Picture could not have been deleted...');
                                break;
                            default:
                                AlertService.error('Picture could not have been deleted due to an unknown error ' + error.status);
                                break;
                        }
                    }
                );
            });
        };

        function createEditableStep() {
            var editableStep = angular.copy(vm.step);
            editableStep.fromDate = new Date(vm.step.fromDate);
            editableStep.toDate = new Date(vm.step.toDate);
            editableStep.coverPicture = getCoverPictureIdFromFullUrl(vm.step.coverPicture);
            editableStep.gpsPoints = JSON.stringify(vm.step.gpsPoints);
            editableStep.published = vm.step.published ? new Date(vm.step.published) : undefined;

            return editableStep;
        }

        function getCoverPictureIdFromFullUrl(coverPictureUrl) {
            if (coverPictureUrl) {
                var pathParts = coverPictureUrl.split('/');
                if (pathParts.length > 1) {
                    return pathParts[pathParts.length - 2];
                }
            }

            return undefined;
        }

        function createSelectableCountries() {
            vm.selectableCountries = angular.copy(countries);
            vm.editableStep.traveledCountries.forEach(function (isoCode) {
                delete vm.selectableCountries[isoCode];
            });
        }
    }
}
