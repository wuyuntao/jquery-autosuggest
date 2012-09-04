/**https://github.com/Takazudo/gruntExamples/blob/master/coffeelint/tasks/coffeelint.js*/
/**
 * coffeelint tasks
 * coffeelint: http://www.coffeelint.org/
 */
module.exports = function(grunt){

  var log = grunt.log;

  function handleResult(files, err, stdout, code, done) {
    var trimed = grunt.helper('trimcolors', stdout);
    var hasError = trimed.indexOf(' 0 errors') === -1;
    if(hasError){
      grunt.helper('growl', 'COFFEELINT FOUND ERROR', trimed);
      log.write(stdout);
      done(false);
    }else{
      log.writeln('coffeelint found no error');
      done(true);
    }
  }

  grunt.registerHelper('coffeelint', function(files, done) {
    var args = {
      cmd: 'coffeelint',
      args: [ files.join(' ') ]
    };
    grunt.helper('exec', args, function(err, stdout, code){
      handleResult(files, err, stdout, code, done);
    });
    return true;
  });

  grunt.registerMultiTask('coffeelint', 'coffeelint', function() {
    var done = this.async();
    var files = this.data.files;
    grunt.helper('coffeelint', files, done);
    return true;
  });

};