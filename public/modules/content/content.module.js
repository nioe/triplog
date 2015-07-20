'use strict';

module.exports = angular.module('content', [
    require('./trip/trip.module').name,
    require('./stepOverview/stepOverview.module').name,
    require('./stepDetail/stepDetail.module').name,
    require('./login/login.module').name,
    require('../config/config.module').name,
    require('../resource/trips/tripsResource.module').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html').name
]);

module.exports.controller('ContentController', require('./content.controller'));