module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

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
				tasks: ['simplemocha', 'jasmine', 'jshint'],
				options: {
					livereload: true
				}
			},
			htmlcss: {
				files: ['public/**/*.html', 'public/**/*.css', 'public/**/*.less'
				],
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
	grunt.registerTask('default', ['concurrent:dev']);
	grunt.registerTask('build', ['clean:build', 'useminPrepare', 'copy', 'concat', 'cssmin', 'uglify', 'usemin', 'clean:temp']);
};
