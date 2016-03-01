'use strict';

// @ngInject
function LoadingSpinnerController($rootScope) {

    var vm = this;
    vm.isShown = false;

    $rootScope.$on('', function () {
       vm.isShown = true;
    });

    $rootScope.$on('$stateChangeStart', showSpinner);
    $rootScope.$on('$stateNotFound', hideSpinner);
    $rootScope.$on('$stateChangeSuccess', hideSpinner);
    $rootScope.$on('$stateChangeError', hideSpinner);


    function showSpinner() {
        vm.isShown = true;
    }

    function hideSpinner() {
        vm.isShown = false;
    }
}

module.exports = LoadingSpinnerController;