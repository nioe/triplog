'use strict';

module.exports = ShowPictureUploadModal;

// @ngInject
function ShowPictureUploadModal($rootScope, $uibModal, $q) {
    return function () {
        if ($rootScope.loginModalShown) {
            return $q.resolve('Modal already shown');
        }

        $rootScope.loginModalShown = true;

        return $uibModal.open({
            backdrop: 'static',
            templateUrl: require('./loginModal.tpl.html'),
            controller: require('./loginModal.controller'),
            controllerAs: 'login'
        }).result;
    };
}