'use strict';

module.exports = TripController;

// @ngInject
function TripController($rootScope, $scope, $state, $q, $http, loadTripFromLocalStorage, showModal, TripsService, LocalData, EVENT_NAMES, REST_URL_PREFIX) {
    var vm = this;

    reloadTrip().then(initController, goToContentNotFoundPage);

    /************************************** Private Functions **************************************/
    function reloadTrip() {
        return loadTripFromLocalStorage().then(function (trip) {
            vm.trip = trip;
            $state.current.data.pageTitle = vm.trip.displayName;
        }, function (error) {
            // If there is already a defined vm.trip the user is most likely reading a trip which got created right now (id changed)
            if (vm.trip && vm.trip.onlyLocal) {
                $state.go('content.tripOverview');
            } else {
                return $q.reject(error);
            }
        });
    }

    function initController() {
        initEditableTrip();

        // Reload trips into memory if local storage changed
        $scope.$on(EVENT_NAMES.localStorageUpdated, reloadTrip);

        $scope.$on(EVENT_NAMES.trackClicked, function (event, data) {
            $state.go('content.step', {tripId: vm.trip.tripId, stepId: data.stepId});
        });

        vm.isUnread = LocalData .isStepUnread;

        vm.templateToShow = function () {
            return vm.editMode ? 'trip.edit.tpl.html' : 'trip.view.tpl.html';
        };

        $http.get(REST_URL_PREFIX + '/trips/' + vm.trip.tripId + '/gpsPoints').then(function(response) {
            vm.gpsTracks = response.data;
        });

        vm.showMap = function () {
            return $rootScope.isOnline && vm.gpsTracks && vm.gpsTracks.length > 0;
        };
    }

    function goToContentNotFoundPage() {
        $state.go('content.notFound');
    }

    function initEditableTrip() {
        vm.editableTrip = createEditableTrip();
        vm.editMode = $state.params.edit && $rootScope.loggedIn;

        function createEditableTrip() {
            var editableTrip = angular.copy(vm.trip);
            editableTrip.tripDate = new Date(vm.trip.tripDate);
            editableTrip.published = vm.trip.published ? new Date(vm.trip.published) : undefined;

            return editableTrip;
        }

        vm.reset = function () {
            vm.editableTrip = createEditableTrip();
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
                $state.go('content.trip', {edit: undefined});
            });
        };

        vm.saveTrip = function () {
            if (vm.form.$valid) {
                TripsService.updateTrip(vm.editableTrip);
                $state.go('content.trip', {edit: undefined});
            }
        };
    }
}