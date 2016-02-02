'use strict';

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine-jquery', 'jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['progress'],
        files: [
            '.tmp/scripts/vendor.js',
            'public/bower_components/angular-mocks/angular-mocks.js',
            '.tmp/scripts/triplogApp.js',
            'test/**/*.js',
            {
                pattern: 'test/fixtures/**/*.test-data.json',
                watched: true,
                served:  true,
                included: false
            }
        ]

    });
};
