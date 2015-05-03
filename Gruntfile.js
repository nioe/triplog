module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var ngHtml2Js = require('browserify-ng-html2js')({
        extension: 'tpl.html'
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            dist: {
                files: [
                    {src: 'public/index.html', dest: 'dist/index.html'},
                    {
                        expand: true,
                        flatten: true,
                        src: 'public/bower_components/bootstrap-sass/assets/fonts/bootstrap/*',
                        dest: 'dist/fonts/bootstrap'
                    },
                    {expand: true, flatten: true, src: 'public/styles/img/*', dest: 'dist/img'},
                    {expand: true, flatten: true, src: 'public/fonts/*', dest: 'dist/fonts'}
                ]
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'public/styles',
                    cssDir: 'dist/css/',
                    environment: 'production',
                    outputStyle: 'compressed'
                }
            },
            pretty: {
                options: {
                    sassDir: 'public/styles',
                    cssDir: 'dist/css/',
                    environment: 'production',
                    outputStyle: 'expanded'
                }
            }
        },

        browserify: {
            options: {
                transform: [ngHtml2Js, 'debowerify', 'browserify-ngannotate'],
            },
            dist: {
                files: {
                    '.tmp/scripts/triplogApp.js': ['public/modules/**/*.js']
                }
            },
            pretty: {
                files: {
                    'dist/js/triplogApp.js': ['public/modules/**/*.js']
                },
                browserifyOptions: {
                    debug: true
                }
            }
        },

        uglify: {
            all: {
                options: {
                    sourceMap: false,
                    sourceMapIncludeSources: false
                },
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/scripts/',
                        src: ['**/*.js', '!test.js'],
                        dest: 'dist/js'
                    }
                ]
            }
        },

        bower_concat: {
            dist: {
                dest: '.tmp/scripts/vendor.js',
                exclude: [
                    'bootstrap-sass',
                    'jquery',
                    'bourbon'
                ]

            },
            pretty: {
                dest: 'dist/js/vendor.js',
                exclude: [
                    'bootstrap-sass',
                    'jquery',
                    'bourbon'
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                force: true
            },
            all: ['public/**/*.js', 'test/**/*.js']
        },

        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false
            },
            all: {src: ['test/unit/**/*.js']}
        },

        jasmine: {
            files: ['test/integration/**/*.js']
        },

        watch: {
            js: {
                files: ['test/**/*.js', 'public/**/*.js'],
                tasks: ['simplemocha', 'jasmine', 'jshint', 'dist-pretty'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['public/**/*.html'],
                tasks: ['dist-pretty'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['public/**/*.scss', 'public/**/*.less', 'public/**/*.css'],
                tasks: ['compass:pretty'],
                options: {
                    livereload: true
                }
            }
        },

        nodemon: {
            dev: {
                script: 'server.js'
            }
        },

        concurrent: {
            dev: ["nodemon", "watch"],
            options: {
                logConcurrentOutput: true
            }
        },

        clean: {
            dist: ['dist'],
            temp: ['.tmp']
        }

    });

    grunt.registerTask('test', ['simplemocha', 'jasmine', 'jshint']);

    grunt.registerTask('dist', ['clean:dist', 'copy', 'browserify:dist', 'bower_concat:dist', 'uglify', 'compass:dist', 'clean:temp']);

    grunt.registerTask('dist-pretty', ['clean:dist', 'copy', 'browserify:pretty', 'bower_concat:pretty', 'compass:pretty', 'clean:temp']);
    grunt.registerTask('live', ['dist-pretty', 'concurrent:dev']);
    grunt.registerTask('default', ['live']);
};
