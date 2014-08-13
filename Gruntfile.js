module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compass: {
			dist: {
				options: {
					sassDir: 'app/sass',
					cssDir: 'app/stylesheets'
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
                    'bundle.js': [
                        'app/js/*.js',
                        ]
                }
            },
       }
	});
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default',['compass', 'browserify']);
	grunt.registerTask('heroku',['compass']);
}