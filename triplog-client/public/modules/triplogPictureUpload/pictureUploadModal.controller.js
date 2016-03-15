'use strict';

module.exports = ModalInstanceController;

// @ngInject
function ModalInstanceController($uibModalInstance, step) {
    var vm = this;

    vm.step = step;

    vm.close = function (result) {
        $uibModalInstance.close(result);
    };
}