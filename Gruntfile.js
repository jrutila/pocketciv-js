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
			}
		},
		watch: {
			css: {
				files: '**/*.scss',
				tasks: ['compass']
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
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.registerTask('default',['compass', 'browserify', 'bower:install']);
	grunt.registerTask('heroku',['compass', 'browserify', 'bower:install']);
}