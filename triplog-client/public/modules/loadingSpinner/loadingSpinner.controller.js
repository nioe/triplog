'use strict';

// @ngInject
function LoadingSpinnerController($http) {

    var vm = this;

    vm.isShown = function () {
        return $http.pendingRequests.length !== 0;
    };
}

module.exports = LoadingSpinnerController;