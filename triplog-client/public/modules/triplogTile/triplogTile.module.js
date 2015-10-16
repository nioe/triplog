'use strict';

module.exports = angular.module('triplogTile', [

    // Template module dependencies (created with browserify-ng-html2js)
    require('./triplogTileBox.tpl.html').name,
    require('./triplogTile.tpl.html').name
]);

module.exports.directive('triplogTileBox', require('./triplogTileBox.directive'));
module.exports.directive('triplogTile', require('./triplogTile.directive'));