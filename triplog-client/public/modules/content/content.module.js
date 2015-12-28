'use strict';

module.exports = angular.module('content', [
    'hc.marked',
    'LocalStorageModule',
    require('modules/trip').name,
    require('modules/stepOverview').name,
    require('modules/stepDetail').name,
    require('modules/login').name,
    require('modules/config').name,
    require('modules/tripsResource').name,
    require('modules/loginResource').name,
    require('modules/alert').name,
    require('modules/modalMessage').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./content.tpl.html').name
]);

module.exports.config(['markedProvider', 'REST_URL_PREFIX', function (markedProvider, REST_URL_PREFIX) {
    markedProvider.setRenderer({
        heading: function (text, level) {
            var subLevel = level + 1;
            return '<h' + subLevel + '>' + text + '</h' + subLevel + '>';
        },

        image: function (href, title, text) {
            href = href || '';
            var imageName;

            if (href.indexOf('http') !== 0) {
                href = REST_URL_PREFIX + '/' + href;
                imageName = href.substr(href.lastIndexOf('/') + 1);
            }

            var img = '<img src="' + href + '"';
            img += text ? ' alt="' + text + '"' : '';
            img += imageName ? ' onclick="angular.element(this).scope().content.openPicture(\'' + imageName + '\')"' : '';
            img += '>';

            return img;
        }
    });
}]);

module.exports.controller('ContentController', require('./content.controller'));

module.exports.constant('CONTENT_STORAGE_KEYS', {
    READ_STEPS: 'read-steps'
});