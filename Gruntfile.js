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

        sass: {
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'compressed'
                },
                files: {
                    'dist/css/all.css': 'public/styles/all.scss'
                }
            },
            pretty: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dist/css/all.css': 'public/styles/all.scss'
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
            all: ['public/modules/**/*.js', 'test/**/*.js']
        },

        watch: {
            js: {
                files: ['test/**/*.js', 'public/**/*.js'],
                tasks: ['test', 'dist-pretty'],
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
                script: 'server.js',
                options: {
                    callback: function (nodemon) {
                        nodemon.on('config:update', function () {
                            setTimeout(function () {
                                require('open')('http://localhost:5400');
                            }, 1000);
                        });
                    }
                }
            }
        },

        concurrent: {
            dev: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },

        clean: {
            dist: ['dist'],
            temp: ['.tmp']
        }
    });

    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('dist', ['test', 'clean:dist', 'copy', 'browserify:dist', 'bower_concat:dist', 'uglify', 'sass:dist', 'clean:temp']);

    grunt.registerTask('dist-pretty', ['clean:dist', 'copy', 'browserify:pretty', 'bower_concat:pretty', 'sass:pretty', 'clean:temp']);
    grunt.registerTask('live', ['dist-pretty', 'test', 'concurrent:dev']);
    grunt.registerTask('default', ['live']);
};
