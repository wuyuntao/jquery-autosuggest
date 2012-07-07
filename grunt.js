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
      },
      css1 : {
        src : [
          '<config:sass.dist1.dest>'
        ],
        dest : 'dist/jquery.autoSuggest.css'
      }
    },
    min : {
      dist : {
        src : ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest : 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit : {
      files : ['http://localhost:' + port + '/test/jquery.autoSuggest.html']
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
    sass : {
      dist1 : { src : 'src/jquery.autoSuggest.scss', dest : 'src/jquery.autoSuggest.css' }
    },
    cssmin : {
      all : {
        src : '<config:concat.css1.dest>',
        dest : 'dist/jquery.autoSuggest.min.css'
      }
    },
    watch : {
      coffee : {
        files : '<config:coffee.dist1.files>',
        //tasks : 'coffeelint:dist1 coffee:dist1 ok'
        tasks : 'coffee:dist1 ok'
      },
      sass : {
        files : '<config:sass.dist1.src>',
        tasks : 'sass:dist1 cssmin ok'
      }
    }
  });

  grunt.loadTasks('tasks');

  // Default task: Complete testing and building.
  grunt.registerTask('default', 'sass lint coffee concat cssmin server qunit concat min');

  // Build task: Only building jquery.autoSuggest.min.js
  grunt.registerTask('build', 'sass coffee concat cssmin min');

  // Test task: Only testing the code (linting and unit tests).
  grunt.registerTask('test', 'sass lint coffee server qunit');

};
