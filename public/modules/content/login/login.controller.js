'use strict';

// @ngInject
function LoginController(LoginService, $state, $rootScope) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            var referrer = $state.params.referrerState;
            if (referrer.state.name) {
                $state.go(referrer.state.name, referrer.params, {reload: true});
            } else {
                $state.go('content.allTrips', undefined, {reload: true});
            }

            $rootScope.alerts.push({
                msg: 'Successfully logged in as user ' + vm.username + '.',
                type: 'success'
            });
        }, function (response) {
            if (response.status === 401) {
                // Unauthorized
                vm.loginError = true;
                $rootScope.alerts.push({
                    msg: 'Invalid username or password.',
                    type: 'danger'
                });
            } else {
                // Error occurred
                $rootScope.alerts.push({
                    msg: 'An unknown error occurred during the login process. Please try again.',
                    type: 'danger'
                });
            }

        });
    };
}

module.exports = LoginController;