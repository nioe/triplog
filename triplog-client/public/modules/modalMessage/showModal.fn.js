'use strict';

module.exports = ShowModal;

// @ngInject
function ShowModal($modal) {
    return function (title, message, okText, cancelText) {
        var modalInstance = $modal.open({
            templateUrl: require('./modal.tpl.html').name,
            controller: require('./modalInstance.controller'),
            controllerAs: 'modalInstance',
            resolve: {
                modalData: {
                    title: title,
                    message: message,
                    okText: okText,
                    cancelText: cancelText
                }
            }
        });

        return modalInstance.result;
    };
}