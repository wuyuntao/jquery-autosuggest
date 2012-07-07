/**
 * cssmin tasks
 * sqwish: https://github.com/ded/sqwish
 */
module.exports = function(grunt){

  var log = grunt.log;

  function handleResult(from, dest, err, stdout, code, done) {
    if(err){
      grunt.helper('growl', 'SQWISH GOT ERROR', stdout);
      log.writeln(from + ': failed to compile to ' + dest + '.');
      log.writeln(stdout);
      done(false);
    }else{
      log.writeln(from + ': compiled to ' + dest + '.');
      done(true);
    }
  }

  grunt.registerHelper('cssmin', function(src, dest, done) {
    var args = {
      cmd: 'sqwish',
      args: [ src, '-o', dest ]
    };
    grunt.helper('exec', args, function(err, stdout, code){
      handleResult(src, dest, err, stdout, code, done);
    });
    return true;
  });

  grunt.registerMultiTask('cssmin', 'minify css by sqwish', function() {
    var done = this.async();
    var src = this.data.src;
    var dest = this.data.dest;
    grunt.helper('cssmin', src, dest, done);
    return true;
  });

};