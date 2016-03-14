'use strict';

// @ngInject
function Timestamps() {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'timestamps.tpl.html',
        scope: {
            model: '='
        }
    };
}

module.exports = Timestamps;