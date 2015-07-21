'use strict';

// @ngInject
function LoginController() {
    var vm = this;

    vm.login = function () {
        console.log('Username', vm.username);
        console.log('Password', vm.password);
    };
}

module.exports = LoginController;