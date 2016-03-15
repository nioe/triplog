'use strict';

// @ngInject
function LoadingSpinnerDirective() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'loadingSpinner.tpl.html',
        link: link
    };

    function link(scope, element) {
        scope.$on('$stateChangeStart', showSpinner);
        scope.$on('$stateNotFound', hideSpinner);
        //scope.$on('$stateChangeSuccess', hideSpinner);
        scope.$on('$stateChangeError', hideSpinner);
        scope.$on('$viewContentLoaded', hideSpinner);

        function showSpinner() {
            element.removeClass('ng-hide');
        }

        function hideSpinner() {
            element.addClass('ng-hide');
        }
    }
}

module.exports = LoadingSpinnerDirective;
