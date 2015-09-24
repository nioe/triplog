'use strict';

// @ngInject
function LoadingSpinnerDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'loadingSpinner.tpl.html',
        controller: require('./loadingSpinner.controller'),
        controllerAs: 'loadingSpinner',
        bindToController: true
    };
}

module.exports = LoadingSpinnerDirective;