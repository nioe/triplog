module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	var ngHtml2Js = require('browserify-ng-html2js')({
		extension: 'tpl.html'
	});

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			dist: {
				files: [{src: 'public/index.html', dest: 'dist/index.html'}]
			}
		},

		compass: {
			dist: {
				options: {
					sassDir: 'public/styles',
					cssDir: 'public/styles',
					environment: 'production'
				}
			}
		},

		'useminPrepare': {
			options: {
				dest: 'dist'
			},
			html: 'public/index.html'
		},

		usemin: {
			html: ['dist/index.html']
		},

		browserify: {
			options: {
				transform: [ngHtml2Js, 'debowerify', 'browserify-ngannotate'],
				browserifyOptions: {
					debug: true
				}
			},
			dist: {
				files: {
					'.tmp/scripts/triplogApp.js': ['public/modules/**/*.js']
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
            all: {
                dest: '.tmp/scripts/vendor.js',
                exclude: [
					'bootstrap',
					'jquery',
					'less'
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
			files:['test/integration/**/*.js']
		},

		watch: {
			js: {
				files: ['test/**/*.js', 'public/**/*.js'
				],
				tasks: ['simplemocha', 'jasmine', 'jshint', 'dist'],
				options: {
					livereload: true
				}
			},
			htmlcss: {
				files: ['public/**/*.html', 'public/**/*.css', 'public/**/*.less'
				],
                tasks: ['dist'],
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
			build: ['dist'],
			temp: ['.tmp']
		}

	});

	grunt.registerTask('test', ['simplemocha', 'jasmine', 'jshint']);
	grunt.registerTask('build', ['clean:build', 'useminPrepare', 'copy', 'concat', 'browserify:dist', 'cssmin', 'uglify', 'usemin', 'clean:temp']);
	grunt.registerTask('dist', ['clean:build', 'useminPrepare', 'copy', 'concat', 'browserify:dist', 'bower_concat', 'uglify', 'cssmin', 'usemin', 'clean:temp']);
	grunt.registerTask('default', ['dist', 'concurrent:dev']);
};
