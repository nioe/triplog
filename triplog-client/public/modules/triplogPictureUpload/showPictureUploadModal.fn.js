'use strict';

module.exports = ShowPictureUploadModal;

// @ngInject
function ShowPictureUploadModal($uibModal) {
    return function (step) {

        return $uibModal.open({
            backdrop: 'static',
            templateUrl: require('./pictureUploadModal.tpl.html'),
            controller: require('./pictureUploadModal.controller'),
            controllerAs: 'pictureUploadModal',
            resolve: {
                step: step
            }
        }).result;
    };
}