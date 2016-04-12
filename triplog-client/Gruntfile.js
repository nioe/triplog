module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var ngHtml2Js = require('browserify-ng-html2js')({
            extension: 'tpl.html'
        }),
        remapifyPlugin = ['remapify', {
            src: 'public/modules/**/*.js',
            filter: function (alias, dirname, basename) {
                if (basename.indexOf('module') !== -1) {
                    return 'modules/' + basename.replace(/\.module\.js$/, '');
                }
                return '../modules/' + basename.replace(/\.js$/, '');
            }
        }],
        rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'public/fonts/icons/triplog.*',
                        dest: 'dist/fonts/icons'
                    }, {
                        cwd: 'public/styles/img',
                        expand: true,
                        src: '**/**',
                        dest: 'dist/img'
                    }, {
                        expand: true,
                        flatten: true,
                        src: 'public/fonts/text/*',
                        dest: 'dist/fonts/text'
                    }, {
                        src: 'public/favicon.ico',
                        dest: 'dist/favicon.ico'
                    }, {
                        src: 'public/robots.txt',
                        dest: 'dist/robots.txt'
                    }, {
                        expand: true,
                        cwd: 'public/bower_components/mapbox.js/images/',
                        src: ['*.svg', '*.png'],
                        dest: 'dist/css/images'
                    }, {
                        expand: true,
                        cwd: 'public/bower_components/leaflet.fullscreen/',
                        src: ['*.svg', '*.png'],
                        dest: 'dist/css/images'
                    }
                ]
            },

            tmp2dist: {
                cwd: '.tmp/scripts',
                src: '**/*',
                dest: 'dist/js',
                expand: true
            },

            index: {
                src: 'public/index.html',
                dest: 'dist/index.html',
                options: {
                    process: function (content) {
                        var robots = grunt.option('prod') ? 'index, follow' : 'noindex, nofollow';
                        return content.replace(/%robots_placeholder%/g, robots);
                    }
                }
            },

            livesass: {
                cwd: 'public/styles',
                src: '**/*',
                dest: 'dist/public/styles',
                expand: true
            },

            css2sassHack: {
                files: [
                    {
                        src: 'public/bower_components/mapbox.js/mapbox.uncompressed.css',
                        dest: 'public/styles/vendor/_mapbox.scss'
                    },
                    {
                        src: 'public/bower_components/leaflet.fullscreen/Control.FullScreen.css',
                        dest: 'public/styles/vendor/_mapbox-full-screen.scss'
                    },
                    {
                        src: 'public/bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
                        dest: 'public/styles/vendor/_mapbox-marker-cluster-default.scss'
                    },
                    {
                        src: 'public/bower_components/leaflet.markercluster/dist/MarkerCluster.css',
                        dest: 'public/styles/vendor/_mapbox-marker-cluster-animation.scss'
                    },
                    {
                        src: 'public/bower_components/dropzone/dist/dropzone.css',
                        dest: 'public/styles/vendor/_dropzone.scss'
                    }
                ],
                options: {
                    process: function (content) {
                        return content.replace(/url\((icon)/g, 'url(./images/$1'); // MapBox icons
                    }
                }
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
                wrap: '\'use strict\';\n\nmodule.exports = {%= __ngModule %}',
                constants: require('./config/default.json')
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
                transform: [ngHtml2Js, 'debowerify', 'browserify-ngannotate'],
                plugin: [remapifyPlugin]
            },
            dist: {
                files: {
                    '.tmp/scripts/triplogApp.js': ['public/modules/triplogApp.js']
                }
            },
            pretty: {
                files: {
                    '.tmp/scripts/triplogApp.js': ['public/modules/triplogApp.js']
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
            options: {
                separator: grunt.util.linefeed + ';' + grunt.util.linefeed
            },
            dist: {
                dest: '.tmp/scripts/vendor.js',
                exclude: [
                    'bootstrap-sass',
                    'jquery',
                    'bourbon',
                    'angular-mocks'
                ],
                dependencies: {
                    'leaflet.fullscreen': 'mapbox.js',
                    'leaflet.markercluster': 'mapbox.js'
                },
                mainFiles: {
                    'leaflet.markercluster': 'dist/leaflet.markercluster-src.js'
                }
            }
        },

        manifest: {
            generate: {
                options: {
                    basePath: 'dist',
                    network: ['*'],
                    preferOnline: false,
                    verbose: true,
                    timestamp: true,
                    hash: true,
                    master: ['index.html'],
                },
                src: [
                    'css/all.css', 'css/images/*', 'fonts/icons/*', 'fonts/text/*', 'img/wallpapers/*', 'js/*'
                ],
                dest: 'dist/manifest.appcache'
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
                browsers: ['PhantomJS'],
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

        connect: {
            options: {
                port: 5400,
                hostname: '*',
                base: 'dist',
                open: true,
                livereload: 35729
            },
            rules: [
                {from: '^/trips(/.*)?$', to: '/index.html'},
                {from: '^/visited-countries$', to: '/index.html'},
                {from: '^/login$', to: '/index.html'},
            ],
            live: {
                options: {
                    middleware: function (connect, options, middlewares) {
                        // RewriteRules support
                        middlewares.push(rewriteRulesSnippet);

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        var directory = options.directory || options.base[options.base.length - 1],
                            serveStatic = require('serve-static');

                        options.base.forEach(function (base) {
                            // Serve static files.
                            middlewares.push(serveStatic(base));
                        });

                        // Make directory browse-able.
                        middlewares.push(serveStatic(directory));


                        return middlewares;
                    }
                }
            }
        },

        clean: {
            options: {
                'force': true
            },
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

    var target = grunt.option('prod') ? 'prod' : 'dev';
    grunt.registerTask('dist', ['clean', 'ngconstant:' + target, 'jshint', 'copy:dist', 'copy:index', 'browserify:dist', 'bower_concat', 'uglify', 'copy:css2sassHack', 'sass:dist', 'manifest', 'karma']);
    grunt.registerTask('deploy', ['dist', 'ftp_push:' + target]);

    grunt.registerTask('dist-pretty', ['clean', 'ngconstant:local', 'jshint', 'browserify:pretty', 'bower_concat', 'copy', 'sass:pretty']);
    grunt.registerTask('live', ['dist-pretty', 'karma', 'configureRewriteRules', 'connect:live', 'watch']);

    grunt.registerTask('default', ['live']);
};
