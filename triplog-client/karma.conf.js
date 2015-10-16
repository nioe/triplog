'use strict';

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine-jquery', 'jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['progress'],
        files: [
            'dist/js/vendor.js',
            'public/bower_components/angular-mocks/angular-mocks.js',
            'dist/js/triplogApp.js',
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
