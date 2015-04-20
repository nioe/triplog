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
					cssDir: 'dist/css/',
					environment: 'production'
				}
			}
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
			},
			pretty: {
				files: {
					'dist/js/triplogApp.js': ['public/modules/**/*.js']
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
				exclude: [
					'bootstrap-sass',
					'jquery'
				]
			},
			dist: {
				dest: '.tmp/scripts/vendor.js'

			},
			pretty: {
				dest: 'dist/js/vendor.js'
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
			dist: ['dist'],
			temp: ['.tmp']
		}

	});

	grunt.registerTask('test', ['simplemocha', 'jasmine', 'jshint']);
	grunt.registerTask('dist', ['clean:dist', 'copy', 'browserify:dist', 'bower_concat:dist', 'uglify', 'compass:dist', 'clean:temp']);
	grunt.registerTask('dist-pretty', ['clean:dist', 'copy', 'browserify:pretty', 'bower_concat:pretty', 'compass:dist', 'clean:temp']);
	grunt.registerTask('default', ['dist', 'concurrent:dev']);
};
