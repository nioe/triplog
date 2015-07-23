'use strict';

// @ngInject
function LoginController(LoginService, $state) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            $state.go('content.allTrips');
        }, function () {
            vm.loginError = true;
        });
    };
}

module.exports = LoginController;