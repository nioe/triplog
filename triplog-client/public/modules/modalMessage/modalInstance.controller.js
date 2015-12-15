'use strict';

module.exports = ModalInstanceController;

function ModalInstanceController($modalInstance, modalData) {
    var vm = this;

    vm.modalData = modalData;

    vm.ok = function (result) {
        $modalInstance.close(result);
    };

    vm.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}