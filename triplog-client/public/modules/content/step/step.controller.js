'use strict';

module.exports = StepController;

// @ngInject
function StepController($rootScope, $scope, $state, $q, loadStepFromLocalStorage, LocalData, showModal, AlertService, StepsService, CountryService, EVENT_NAMES) {
    var vm = this;

    reloadStep().then(initController, goToContentNotFoundPage);

    /************************************** Private Functions **************************************/
    function reloadStep() {
        return loadStepFromLocalStorage().then(function (step) {
            vm.step = step;
            vm.galleryPictures = vm.step.pictures.filter(function (picture) {
                return picture.shownInGallery;
            });
            $state.current.data.pageTitle = vm.step.stepName;
        }, function (error) {
            // If there is already a defined vm.step the user is most likely reading a step which got created right now (id changed)
            if (vm.step && vm.step.onlyLocal) {
                $state.go('content.trip', {tripId: $state.params.tripId});
            } else {
                return $q.reject(error);
            }
        });
    }

    function goToContentNotFoundPage() {
        $state.go('content.notFound');
    }

    function initController() {
        initEditableStep();

        LocalData.markStepAsRead(vm.step);

        vm.showMap = function () {
            return $rootScope.isOnline && ((vm.step.gpsPoints && vm.step.gpsPoints.length > 0) || vm.showGallery());
        };

        vm.showGallery = function () {
            return $rootScope.isOnline && vm.galleryPictures && vm.galleryPictures.length > 0;
        };

        vm.templateToShow = function () {
            return vm.editMode ? 'step.edit.tpl.html' : 'step.view.tpl.html';
        };

        // Reload step into memory if local storage changed
        $scope.$on(EVENT_NAMES.localStorageUpdated, reloadStep);
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
            var valid = true;

            if (vm.editableStep.gpsPoints) {
                try {
                    vm.editableStep.gpsPoints = JSON.stringify(JSON.parse(vm.editableStep.gpsPoints), undefined, 4);
                } catch (error) {
                    valid = false;
                }
            }

            vm.form.gpsPoints.$setValidity('validJson', valid);
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
                $state.go('content.step', {edit: undefined});
            });
        };

        vm.saveStep = function () {
            if (vm.form.$valid) {
                vm.editableStep.gpsPoints = vm.editableStep.gpsPoints ? JSON.parse(vm.editableStep.gpsPoints) : [];

                StepsService.updateStep(vm.editableStep);
                $state.go('content.step', {edit: undefined});
            }
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
            editableStep.pictures.sort(function (picture1, picture2) {
                return picture1.captureDate.localeCompare(picture2.captureDate);
            });
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
