'use strict';

// @ngInject
function LoginController(LoginService, $state, $rootScope) {
    var vm = this;

    vm.loginError = false;

    console.log('$state', $state);

    vm.login = function () {
        LoginService.login(vm.username, vm.password).then(function () {
            var referrer = $state.params.referrerState;
            $state.go(referrer.state.name, referrer.params, { reload: true });

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