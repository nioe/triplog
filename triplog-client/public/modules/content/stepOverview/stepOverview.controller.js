'use strict';

module.exports = StepOverviewController;

// @ngInject
function StepOverviewController($rootScope, $scope, $state, loadTripFromLocalStorage, showModal, TripsService, LocalData, EVENT_NAMES) {
    var vm = this;
    
    reloadTrip().then(initController, goToContentNotFoundPage);

    /************************************** Private Functions **************************************/
    function reloadTrip() {
        return loadTripFromLocalStorage().then(function (trip) {
            vm.trip = trip;

            $state.current.data.pageTitle = vm.trip.displayName;
            $state.current.data.link = {
                title: vm.trip.tripName,
                description: vm.trip.tripLead,
                image: vm.trip.coverPicture
            };
        });
    }

    function initController() {
        initEditableTrip();

        // Reload trips into memory if local storage changed
        $scope.$on(EVENT_NAMES.localStorageUpdated, reloadTrip);

        vm.isUnread = LocalData.isStepUnread;

        vm.templateToShow = function () {
            return vm.editMode ? 'stepOverview.edit.tpl.html' : 'stepOverview.view.tpl.html';
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
                $state.go('content.stepOverview', {edit: undefined});
            });
        };

        vm.saveTrip = function () {
            TripsService.updateTrip(vm.editableTrip);
            $state.go('content.stepOverview', {edit: undefined});
        };
    }
}