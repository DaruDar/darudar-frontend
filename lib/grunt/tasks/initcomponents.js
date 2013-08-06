var qfs = require('q-fs');
module.exports = function(grunt) {
  grunt.registerTask('initcomponents', 'init build components', function(){
    var dir = 'build/components';
    if(grunt.file.exists(dir)) {
        grunt.file.delete(dir, {force: true});
    }
    grunt.file.mkdir(dir);
    qfs.symbolicLink(dir + '/angular', '../../components/angularjs/build', 'dir');
    qfs.symbolicLink(dir + '/jquery', '../../components/jquery', 'dir');
    qfs.symbolicLink(dir + '/bootstrap', '../../components/bootstrap/dist', 'dir');
    qfs.symbolicLink(dir + '/localStorageService', '../../components/localStorageService', 'dir');
  });
}
