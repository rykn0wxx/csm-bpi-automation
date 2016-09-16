'use strict';

module.exports = function (grunt) {

	require('time-grunt')(grunt);

	require('jit-grunt')(grunt);

	var appConfig = {
		app: require('./bower.json').appPath || 'app',
		dist: 'dist',
		host: 'localhost',
		port: 1983
	};

	grunt.initConfig({
		mudly: appConfig,

		watch: {
			options: {
				livereload: '35729'
			},
			bower: {
				files: ['bower.json'],
				tasks: ['wiredep']
			},
			less: {
				files: '<%= mudly.app %>/styles/**/*.less',
				tasks: ['less'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['<%= mudly.app %>/scripts/{,*/}*.js'],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
				'<%= mudly.app %>/{,*/}*.html',
				'<%= mudly.app %>/styles/**/*.less',
				'<%= mudly.app %>/assets/**/*.*',
				'<%= mudly.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			},
			live: {
				files: [
					 '<%= mudly.app %>/{,*/}*.html',
					 '<%= mudly.app %>/styles/{,*/}*.less',
					 '<%= mudly.app %>/scripts/{,*/}*.js',
					 '<%= mudly.app %>/assets/*.*'
				]
			}
		},

		connect: {
      options: {
        port: '<%= mudly.port %>',
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '<%= mudly.host %>',
        livereload: 35729
      },
			livereload: {
				options: {
					open: true
				}
			}
    },

		konnect: {
			options: {
        port: '<%= mudly.port %>',
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '<%= mudly.host %>',
        livereload: 35729
			},
			livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
							connect().use(
                '/less',
                connect.static('./less')
              ),
              connect().use(
                '/app/fonts',
                connect.static('./app/fonts')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      }
		},
		
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: {
				src: [
					'Gruntfile.js',
					'<%= mudly.app %>/assets/{,*/}*.js'
				]
			}
		},

		wiredep: {
			app: {
				src: ['<%= mudly.app %>/index.html'],
				fileTypes: {
					js: {
						block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
						detect: {
							js: /'(.*\.js)'/gi
						},
						replace: {
							js: '..\'{{filePath}}\','
						}
					}
				}
			}
		},

		less: {
			dev: {
				options: {
					paths: ['styles']
				},
				files: {
					'<%= mudly.app %>/styles/kohana.css' : '<%= mudly.app %>/styles/kohana.less'
				}
			}
		}

	});

	
	grunt.registerTask('default', [
		'wiredep',
		'less',
		'connect',
		'watch'
	]);

	grunt.registerTask('kaf', [
		'wiredep',
		'less',
		'connect',
		'watch'
	]);

};