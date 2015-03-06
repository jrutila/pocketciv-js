// Generated on 2015-01-09 using generator-angular-fullstack 2.0.13
'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }
  var mozjpeg = require('imagemin-mozjpeg');

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    buildcontrol: 'grunt-build-control',
    sprite: 'grunt-spritesmith',
    browserify: 'grunt-browserify',
    bower: 'grunt-bower-task',
    preprocess: 'grunt-preprocess',
    uglify: 'grunt-contrib-uglify',
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          'src/**/*.js',
          '!<%= yeoman.client %>/{apnp,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      sprite: {
        files: [
          '<%= yeoman.client %>/{app,components}/images/**/icons/*.png'
        ],
        tasks: ['sprite']
      },
      browserify: {
        files: [
          'src/**/*.js',
          '<%= yeoman.client %>/{app,components}/**/*.js',
        ],
        tasks: ['browserify']
        
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      injectSass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['injector:sass']
      },
      sass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      jade: {
        files: [
          '<%= yeoman.client %>/{app,components}/*',
          '<%= yeoman.client %>/{app,components}/**/*.jade'],
        tasks: ['jade']
      },
      html: {
        files: [
          '<%= yeoman.client %>/*.html'],
        tasks: ['injector', 'wiredep']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },
    sprite:{
      css: {
        src: 'client/images/modern/icons/*.png',
        dest: '.build/images/spritesheet.png',
        destCss: '.build/css/sprites.css',
        cssOpts: {
          cssSelector: function(i) { return "."+i.name; }
        }
      },
      scss: {
        src: 'client/images/modern/icons/*.png',
        dest: '.build/images/spritesheet.png',
        destCss: '.build/scss/sprite/sprites.scss',
        cssOpts: {
          cssSelector: function(i) { return "."+i.name; }
        }
      },
    },
    browserify: {
        '.build/js/pocketciv.js': [ 'src/**/*.js'],
        '.build/js/web.js': [ '.build/app/*.js', '.build/app/**/*.js' ]
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '.build',
          ]
        }]
      },
      server: '.tmp'
    },
    
    // Bower install
    /*
    bower: {
     install: {
       //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
       options: {
         layout: 'byComponent',
         install: false,
         verbose: true,
         targetDir: '.tmp/bower_components/'
       }
      } 
    },
    */
    
    preprocess: {
        html: {
          src: 'client/index.html',
          dest: '.build/index.html'
        },
        js: {
          src: 'client/app/controller.js',
          dest: '.build/app/controller.js'
        }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.build/',
          src: '{,*/}*.css',
          dest: '.build/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        //cwd: '.tmp',
        //bowerJson: '../bower.json',
        src: '.build/index.html',
        ignorePath: 'client/',
        //directory: '.tmp/bower_components/',
        exclude: [/bootstrap-sass-official/, /bootstrap.js/, '/json3/', '/es5-shim/',  /font-awesome.css/ ]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '.tmp/{,*/}*.js',
            '.tmp/{,*/}*.css',
            //'.build/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            //'<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {                          // Target
        options: {                       // Target options
          //optimizationLevel: 3,
          //svgoPlugins: [{ removeViewBox: false }],
          //use: [mozjpeg()]
        },
        files: {                         // Dictionary of files
          '.tmp/images/spritesheet.png': '.build/images/spritesheet.png', // 'destination': 'source'
        }
      },
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'workspaceApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      build: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'client',
          dest: '.build',
          src: [
            '**/*.js',
            '**/*.html',
            '**/*.css',
            '**/*.scss',
          ]
        }]
      },
      tmp: {
        files: [{
          expand: true,
          dot: true,
          cwd: '.build',
          dest: '.tmp',
          src: [
            '**/sprites.css',
            'images/spritesheet.png', // 'destination': 'source'
          ]
        }]
      },
    },
    
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'jade',
        'sass',
      ],
      test: [
        'jade',
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'jade',
        'sass',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },


    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          loadPath: [
            'bower_components',
            '.build/app',
            '.build/scss',
          ],
          compass: false
        },
        files: {
          '.build/css/app.css' : '.build/app/app.scss'
        }
      }
    },
    
    
    // Uglify
    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '.tmp/app.min.js': ['.build/js/*.js']
        }
      }
    },
    
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '.build/css',
          src: ['*.css', '!*.min.css', "!sprites.css"],
          dest: '.tmp',
          ext: '.min.css'
        }]
      }
    },
    
    htmlmin: {
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '.build',
          src: ['app/**/*.html'],
          dest: '.tmp',
        },{                                   // Dictionary of files
          '.tmp/index.html': '.build/index.html',     // 'destination': 'source'
        }
        ]
      },
    },
    
    injector: {
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/.build/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          //'<%= yeoman.client %>/index.html': [
          '.build/index.html': [
              [ '.tmp/*.js' ]
          ]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/app/', '');
            filePath = filePath.replace('/.build/app/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '.build/app/app.scss': [
            '.build/app/**/*.{scss,sass}',
            '!.build/app/app.scss'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/.build/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '.build/index.html': [
            '.tmp/*.css', '.tmp/css/*.css'
          ]
        }
      },
    },
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        //'build',
        'env:all',
        'env:prod',
        'express:dev',
        'express-keepalive'
        ]);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'preprocess',
        'injector:sass', 
        'browserify',
        'sprite',
        'injector:sprite', 
        'injector:scripts', 
        'injector:css', 
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
      ]);
    }

    grunt.task.run([
      'clean:server',
      'env:all',
      'injector:sass', 
      'browserify',
      'sprite',
      'concurrent:server',
      'injector',
      'wiredep',
      'preprocess',
      'autoprefixer',
      'express:dev',
      'wait',
      //'open',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass', 
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'injector:sass', 
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else grunt.task.run([
      'test:server',
      'test:client'
    ]);
  });

  grunt.registerTask('heroku', [
      'clean',
      'env:prod',
      'copy:build',
//      'bower',
      'preprocess',
      'wiredep',
      'browserify',
      'sprite',
      'injector:sass',
      'sass',
      'uglify',
      'autoprefixer',
      'cssmin',
      'copy:tmp',
      'rev',
      'injector', 
      'htmlmin',
      
      
      /*
      'injector:sass', 
      'injector:css', 
      'concurrent:server',
      'injector',
      //'express:dev',
      //'wait',
      //'open',
      //'watch'
      */
  ]);
};
