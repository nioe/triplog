'use strict';

// @ngInject
function LoginController(LoginService, $state, $rootScope) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            $state.go('content.allTrips');
            $rootScope.alerts.push({
                msg: 'Successfully logged in as user ' + vm.username + '.',
                type: 'success'
            });
        }, function () {
            vm.loginError = true;
            $rootScope.alerts.push({
                msg: 'Invalid username or password.',
                type: 'danger'
            });
        });
    };
}

module.exports = LoginController;