'use strict';

// @ngInject
function DateLine() {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'dateLine.tpl.html',
        scope: {
            fromDate: '@',
            toDate: '@'
        }
    };
}

module.exports = DateLine;