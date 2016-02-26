'use strict';

module.exports = angular.module('modalMessage', [
    'ui.bootstrap',

    // Template module dependencies (created with browserify-ng-html2js)
    require('./modal.tpl.html')
]);

module.exports.factory('showModal', require('./showModal.fn'));