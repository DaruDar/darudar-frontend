var spawn = require('child_process').spawn;
var qfs = require('q-fs');
module.exports = function(grunt) {  
  grunt.registerTask('builddocs', 'create angular docs', function(){
    
    grunt.file.write('docs/content/misc/contribute.ngdoc',
        '@ngdoc overview\n@name Contributing\n@description\n' +
        grunt.file.read('README.md')
    );
    
    if(grunt.file.exists('build/docs')) {
        grunt.file.delete('build/docs', {force: true});
    }

    var done = this.async();

    var docs  = spawn('node', ['docs/src/gen-docs.js']);
    docs.stdout.pipe(process.stdout);
    docs.stderr.pipe(process.stderr);
    docs.on('exit', function(code){
      if(code !== 0) grunt.fail.warn('Error creating docs');
      
      qfs.symbolicLink('build/docs/components', '../components', 'dir');
      qfs.symbolicLink('build/docs/src', '../../src', 'dir');
      qfs.symbolicLink('build/docs/asset', '../../asset', 'dir');
      qfs.symbolicLink('build/docs/patch', '../../../patch', 'dir');
               
      grunt.log.ok('docs created');
      done();
    });
  });
}
