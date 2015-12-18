'use strict';

module.exports = ModalInstanceController;

// @ngInject
function ModalInstanceController($uibModalInstance, modalData) {
    var vm = this;

    vm.modalData = modalData;

    vm.ok = function (result) {
        $uibModalInstance.close(result);
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}