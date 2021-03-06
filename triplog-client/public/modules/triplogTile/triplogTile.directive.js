'use strict';

// @ngInject
function TriplogTile() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTile.tpl.html',
        scope: {
            tileTitle: '@',
            picture: '@'
        }
    };
}

module.exports = TriplogTile;