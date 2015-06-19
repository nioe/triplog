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
                    {
                        src: 'public/index.html', dest: 'dist/index.html'
                    }, {
                        expand: true,
                        flatten: true,
                        src: 'public/bower_components/bootstrap-sass/assets/fonts/bootstrap/*',
                        dest: 'dist/fonts/bootstrap'
                    }, {
                        expand: true, flatten: true, src: 'public/styles/img/*', dest: 'dist/img'
                    }, {
                        expand: true, flatten: true, src: 'public/fonts/*', dest: 'dist/fonts'
                    }
                ]
            },

            live: {
                cwd: 'public/',
                src: '**/*',
                dest: 'dist/public',
                expand: true
            }
        },

        sass: {
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'compressed',
                    loadPath: ['public/styles', 'public/bower_components']
                },
                files: {
                    'dist/css/all.css': 'public/styles/all.scss'
                }
            },
            pretty: {
                options: {
                    style: 'expanded',
                    loadPath: ['public/styles', 'public/bower_components']
                },
                files: {
                    'dist/css/all.css': 'public/styles/all.scss'
                }
            }
        },

        ngconstant: {
            options: {
                name: 'config',
                dest: 'public/modules/config/config.module.js',
                wrap: '\'use strict\';\n\nmodule.exports = {%= __ngModule %}'
            },
            local: {
                constants: require('./config/local.json')
            },
            dev: {
                constants: require('./config/dev.json')
            },
            prod: {
                constants: require('./config/prod.json')
            }
        },

        browserify: {
            options: {
                transform: [ngHtml2Js, 'debowerify', 'browserify-ngannotate']
            },
            dist: {
                files: {
                    '.tmp/scripts/triplogApp.js': ['public/modules/triplogApp.js']
                }
            },
            pretty: {
                files: {
                    'dist/js/triplogApp.js': ['public/modules/triplogApp.js']
                },
                options: {
                    browserifyOptions: {
                        debug: true
                    }
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
                    'bourbon',
                    'angular-mocks'
                ]

            },
            pretty: {
                dest: 'dist/js/vendor.js',
                exclude: [
                    'bootstrap-sass',
                    'jquery',
                    'bourbon',
                    'angular-mocks'
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['public/modules/**/*.js', 'test/**/*.js']
        },

        karma: {
            all: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['Chrome'],
                reporters: ['progress', 'junit']
            }
        },

        watch: {
            js: {
                files: ['test/**/*.js', 'public/**/*.js'],
                tasks: ['dist-pretty', 'karma'],
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
                tasks: ['sass:pretty'],
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
        },

        ftp_push: {
            dev: {
                options: {
                    authKey: "dev",
                    host: "ftp.bros.pics",
                    dest: ".",
                    port: 21
                },
                files: [
                    {
                        cwd: 'dist/',
                        src: '**/*',
                        expand: true
                    }
                ]
            }
        }
    });

    var target = grunt.option('prod') === true ? 'prod' : 'dev';
    grunt.registerTask('dist', ['ngconstant:' + target, 'jshint', 'clean:dist', 'copy:dist', 'browserify:dist', 'bower_concat:dist', 'uglify', 'sass:dist', 'karma', 'clean:temp']);
    grunt.registerTask('deploy', ['dist', 'ftp_push:' + target]);

    grunt.registerTask('dist-pretty', ['ngconstant:local', 'jshint', 'clean:dist', 'copy', 'browserify:pretty', 'bower_concat:pretty', 'sass:pretty']);
    grunt.registerTask('live', ['dist-pretty', 'concurrent:dev', 'karma']);

    grunt.registerTask('default', ['live']);
};
