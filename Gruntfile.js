var grunt = require('grunt')
// change the tasks in the list to your production tasks
grunt.registerTask('heroku',
    ['compass:dist']);