/*global module:false*/
module.exports = function (grunt) {

  var port = 40000 + Math.round(1000 * Math.random());

  // Project configuration.
  grunt.initConfig({
    pkg : '<json:package.json>',
    meta : {
      banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat : {
      dist : {
        src : ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
        dest : 'dist/<%= pkg.name %>.js'
      }
    },
    min : {
      dist : {
        src : ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest : 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit : {
      files : ['test/jquery.autoSuggest.html']
    },
    server : {
      port : port,
      base : '.'
    },
    lint : {
      files : ['grunt.js', 'test/jquery.autoSuggest*.js']
    },
    jshint : {
      options : {
        curly : true,
        eqeqeq : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        boss : true,
        eqnull : true,
        browser : true
      },
      globals : {
        jQuery : true
      }
    },
    uglify : {},
    coffee : {
      dist1 : {
        files : [ 'src/jquery.autoSuggest.coffee' ],
        dest : 'src/jquery.autoSuggest.js'
      }
    },
    coffeelint : {
      dist1 : {
        files : [ '<config:coffee.dist1.files>' ]
      }
    },
    cssmin : {
      all : {
        src : 'dist/jquery.autoSuggest.css',
        dest : 'dist/jquery.autoSuggest.min.css'
      }
    },
    compass : {
      dev : {
        src : 'scss',
        dest : 'src',
        linecomments : true,
        forcecompile : true,
        //require : 'animate-sass mylib',
        debugsass : false,
        images : 'images',
        relativeassets : true
      },
      prod : {
        src : 'scss',
        dest : 'dist',
        // outputstyle : 'compressed', // will be done w/ cssmin to provide a non minified version & license
        linecomments : false,
        forcecompile : true,
        //require : 'animate-sass mylib',
        debugsass : false,
        images : 'images',
        relativeassets : true
      }
    },
    watch : {
      coffee : {
        files : '<config:coffee.dist1.files>',
        //tasks : 'coffeelint:dist1 coffee:dist1 ok'
        tasks : 'coffee:dist1 qunit ok'
      },
      compass : {
        files : 'scss/*.scss',
        tasks : 'compass:dev ok'
      },
      lint : {
        files : '<config:lint.files>',
        tasks : 'lint qunit'
      }
    }
  });

  grunt.loadTasks('tasks');

  // Default task: Complete testing and building.
  grunt.registerTask('default', 'compass lint coffee concat cssmin qunit min');

  // Build task: Only building jquery.autoSuggest.min.js
  grunt.registerTask('build', 'compass coffee concat cssmin min');

  // Test task: Only testing the code (linting and unit tests).
  grunt.registerTask('test', 'compass:dev lint coffee qunit');

  // Travis: CI Server
  grunt.registerTask('travis', 'compass lint coffee concat cssmin qunit min');

};
