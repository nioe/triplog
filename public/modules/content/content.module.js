'use strict';

module.exports = angular.module('content', [
    require('../config/config.module').name,
    require('../resource/trips/tripsResource.module').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html').name
]);

module.exports.controller('ContentController', require('./content.controller'));