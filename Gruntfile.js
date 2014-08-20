module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compass: {
			dist: {
				options: {
					appDir: 'app/',
					//sassDir: 'sass',
					//cssDir: 'app/stylesheets'
				}
			},
			dev: {
				options: {
					appDir: 'app/',
					watch: true
				}
			}
		},
		concurrent: {
			dev: 
				['watchify', 'compass:dev']
		},
		watchify: {
	      dev: {
	        src: './app/js/controller.js',
	        dest: 'app/bundle.js'
	      },
	    },
		watch: {
			css: {
				files: '**/*.scss',
				tasks: ['compass']
			},
	        app: {
		        files: 'app/js/bundle.js',
		        options: {
		          livereload: true
	        	}
		    }
		},
		browserify: {
            dist: {
                files: {
                    'app/bundle.js': [
                        'app/js/*.js',
                        ]
                }
            },
       },
       bower: {
	     install: {
	       //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
	     },
	     options: {
	     	targetDir: './app/lib'
	     }
	   }
	});
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-watchify');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.registerTask('default',['bower:install', 'concurrent']);
	grunt.registerTask('heroku',['compass:dist', 'browserify', 'bower:install']);
}