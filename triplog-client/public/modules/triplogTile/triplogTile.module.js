'use strict';

module.exports = angular.module('triplogTile', [

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogTileBox.tpl.html'),
    require('./triplogTile.tpl.html')
]);

module.exports.directive('triplogTileBox', require('./triplogTileBox.directive'));
module.exports.directive('triplogTile', require('./triplogTile.directive'));