#global module:false

module.exports = (grunt) ->
  'use strict'

  port = 40000 + Math.round(1000 * Math.random())

  banner = "/*! <%= pkg.title%> - v<%= pkg.version%> - <%= grunt.template.today('yyyy-mm-dd')%>\n
 * URL: <%= pkg.homepage%>\n
 * Copyright (c) <%= grunt.template.today('yyyy')%> <%= pkg.author.name%>\n
 * Licensed <%= grunt.util._.pluck(pkg.licenses, 'type').join(', ')%> */\n\n"

  # Project configuration.
  grunt.initConfig
    pkg : grunt.file.readJSON('package.json')

    clean :
      dist : ['dist/*.*']

    concat :
      dist :
        options :
          banner : banner
        src : [ 'src/jquery.autoSuggest.js' ]
        dest : 'dist/jquery.autoSuggest.js'

    uglify :
      dist :
        options :
          banner : banner
        files :
          'dist/jquery.autoSuggest.min.js' : '<%= concat.dist.src %>'

    qunit :
      files : ['test/jquery.autoSuggest.html']

    connect :
      server :
        options :
          port : port
          base : '.'

    jshint :
      files : ['test/jquery.autoSuggest*.js']
      options :
        curly : true
        eqeqeq : true
        immed : true
        latedef : true
        newcap : true
        noarg : true
        sub : true
        undef : true
        boss : true
        eqnull : true
        browser : true
      globals :
        jQuery : true

    coffee :
      dist :
        options :
          bare : false
        files :
          'src/jquery.autoSuggest.js' : 'src/jquery.autoSuggest.coffee'

    coffeelint :
      grunt :
        files :
          src : [ 'Gruntfile.coffee' ]
        options :
          'indentation' :
            value : 2
          'max_line_length' :
            value : 120
      dist :
        files :
          src : [ 'src/*.coffee' ]
        options :
          'indentation' :
            value : 2
          'max_line_length' :
            value : 200

    cssmin :
      all :
        src : 'dist/jquery.autoSuggest.css'
        dest : 'dist/jquery.autoSuggest.min.css'

    compass :
      dev :
        options :
          sassDir : 'scss'
          cssDir : 'src'
          imagesDir : 'images'
          noLineComments : false
          force : true
          debugInfo : false
          relativeAssets : true
      prod :
        options :
          sassDir : 'scss'
          cssDir : 'dist'
          imagesDir : 'images'
        # outputstyle : 'compressed', // will be done w/ cssmin to provide a non minified version & license
          noLineComments : true
          force : true
          debugInfo : false
          relativeAssets : true

    watch :
      coffee :
        files : '<config:coffee.dist.files>'
        tasks : 'coffeelint:dist coffee:dist qunit ok'
      compass :
        files : 'scss/*.scss'
        tasks : 'compass:dev ok'
      test :
        files : '<config:jshint.files>'
        tasks : 'jshint qunit'

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  # Default task: Complete testing and building.
  grunt.registerTask 'default', ['compass', 'jshint', 'coffee', 'concat', 'cssmin', 'qunit', 'uglify']

  # Build task: Only building jquery.autoSuggest.min.js
  grunt.registerTask 'build', ['compass', 'coffee', 'concat', 'cssmin', 'uglify']

  # Test task: Only testing the code (linting and unit tests).
  grunt.registerTask 'test', ['compass:dev', 'jshint', 'coffee', 'qunit']

  # Travis: CI Server
  grunt.registerTask 'travis', ['compass', 'jshint', 'coffee', 'concat', 'cssmin', 'qunit', 'uglify']