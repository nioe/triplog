'use strict';

module.exports = ShowModal;

// @ngInject
function ShowModal($uibModal) {
    return function (modalData) {
        var defaultModalData = {
            title: 'Continue?',
            message: 'Do you want to continue?',
            okText: 'Yes',
            okClass: 'btn-primary',
            cancelText: 'No',
            cancelClass: 'btn-danger'
        };

        if (!modalData) {
            modalData = defaultModalData;
        }

        return $uibModal.open({
            backdrop: 'static',
            templateUrl: require('./modal.tpl.html'),
            controller: require('./modalInstance.controller'),
            controllerAs: 'modalInstance',
            resolve: {
                modalData: {
                    title: modalData.title || defaultModalData.title,
                    message: modalData.message || defaultModalData.message,
                    okText: modalData.okText || defaultModalData.okText,
                    okClass: modalData.okClass || defaultModalData.okClass,
                    cancelText: modalData.cancelText || defaultModalData.cancelText,
                    cancelClass: modalData.cancelClass || defaultModalData.cancelClass
                }
            }
        }).result;
    };
}