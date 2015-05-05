'use strict';

// @ngInject
function ContentController($state, $stateParams) {
    var vm = this;
    vm.navbarCollapsed = true;

    vm.toggleNavBar = function () {
        vm.navbarCollapsed = !vm.navbarCollapsed;
    }
}

module.exports = ContentController;