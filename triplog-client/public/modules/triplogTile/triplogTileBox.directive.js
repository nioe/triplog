'use strict';

// @ngInject
function TriplogTileBox() {

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'triplogTileBox.tpl.html',
        scope: false
    };
}

module.exports = TriplogTileBox;