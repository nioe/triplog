'use strict';

// @ngInject
function LoginController(LoginService, AlertService, $state) {
    var vm = this;

    vm.loginError = false;

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            var referrer = $state.params.referrerState;
            if (referrer.state.name) {
                $state.go(referrer.state.name, referrer.params, {reload: true});
            } else {
                $state.go('content.tripOverview', undefined, {reload: true});
            }

            AlertService.success('Successfully logged in as user ' + vm.username + '.');
        }, function (response) {
            switch (response.status) {
                case 401:
                    vm.loginError = true;
                    AlertService.error('Invalid username or password.');
                    break;

                case 'offline':
                    AlertService.info(response.data);
                    break;

                default:
                    AlertService.error('An unknown error occurred during the login process. Please try again.');
            }
        });
    };
}

module.exports = LoginController;