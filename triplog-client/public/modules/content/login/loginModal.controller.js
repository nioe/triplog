'use strict';

module.exports = LoginModalController;

// @ngInject
function LoginModalController($rootScope, LoginService, $state, $uibModalInstance) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(successfullyLoggedIn, loginError);
    };

    vm.cancel = function () {
        LoginService.logout().then(function () {
            $uibModalInstance.close();
            $state.go('content.allTrips', {}, {reload: true});
        });
    };

    function successfullyLoggedIn (result) {
        $uibModalInstance.close(result);
        $rootScope.loginModalShown = false;
        $state.go($state.current.name, $state.current.params, {reload: true});
    }

    function loginError(error) {
        switch (error.status) {
            case 401:
                vm.loginError = true;
                vm.errorMessage = 'Invalid username or password.';
                break;

            case 'offline':
                vm.errorMessage = error.data;
                break;

            default:
                vm.errorMessage = 'An unknown error occurred during the login process. Please try again.';
        }
    }
}