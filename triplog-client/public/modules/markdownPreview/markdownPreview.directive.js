'use strict';

// @ngInject
function LoadingSpinnerDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'markdownPreview.tpl.html',
        controller: require('./markdownPreview.controller.js'),
        controllerAs: 'preview',
        bindToController: true,
        scope: {
            model: '='
        }
    };
}

module.exports = LoadingSpinnerDirective;