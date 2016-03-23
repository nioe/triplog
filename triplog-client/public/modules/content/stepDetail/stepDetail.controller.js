'use strict';

module.exports = StepDetailController;

// @ngInject
function StepDetailController($rootScope, $scope, $state, loadStepFromLocalStorage, LocalData, showModal, AlertService, StepsService, CountryService, EVENT_NAMES) {
    var vm = this;

    reloadStep();
    initEditableStep();

    LocalData.markStepAsRead(vm.step);

    vm.showMap = function () {
        return $rootScope.isOnline && vm.step.gpsPoints && vm.step.gpsPoints.length > 0;
    };

    vm.showGallery = function () {
        return $rootScope.isOnline && vm.galleryPictures && vm.galleryPictures.length > 0;
    };

    vm.templateToShow = function () {
        return vm.editMode ? 'stepDetail.edit.tpl.html' : 'stepDetail.view.tpl.html';
    };

    // Reload step into memory if local storage changed
    $scope.$on(EVENT_NAMES.localStorageUpdated, reloadStep);


    /************************************** Private Functions **************************************/
    function reloadStep() {
        vm.step = loadStepFromLocalStorage();
        vm.galleryPictures = vm.step.pictures.filter(function (picture) {
            return picture.shownInGallery;
        });

        $state.current.data.pageTitle = vm.step.stepName;
        $state.current.data.link = {
            title: vm.step.stepName,
            description: vm.step.stepLead,
            image: vm.step.coverPicture
        };
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

        vm.getCountryNameFor = CountryService.getCountryNameFor;

        vm.prettifyGpsPoints = function () {
            try {
                vm.editableStep.gpsPoints = JSON.stringify(JSON.parse(vm.editableStep.gpsPoints), undefined, 4);
                vm.gpsPointJsonInvalid = false;
            } catch (error) {
                vm.gpsPointJsonInvalid = true;
            }
        };

        vm.reset = function () {
            vm.gpsPointJsonInvalid = false;
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

        vm.saveButtonDisabled = function () {
            return vm.gpsPointJsonInvalid;
        };

        vm.saveStep = function () {
            vm.editableStep.gpsPoints = JSON.parse(vm.editableStep.gpsPoints);

            StepsService.updateStep(vm.editableStep);
            $state.go('content.stepOfTrip', {edit: undefined});
        };

        vm.showPictureDeleteButton = function () {
            return $rootScope.isOnline;
        };

        vm.setAsCoverPicture = function (pictureId) {
            vm.editableStep.coverPicture = pictureId;
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
            editableStep.gpsPoints = JSON.stringify(vm.step.gpsPoints, undefined, 4);
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
            vm.selectableCountries = CountryService.getAllCountries();
            vm.editableStep.traveledCountries.forEach(function (isoCode) {
                delete vm.selectableCountries[isoCode];
            });
        }
    }
}
