var fs = require('fs');
module.exports = function(grunt) {  
  grunt.registerTask('crontasks', 'Execute cron tasks', function () {
    grunt.file.mkdir('tasks');
    fs.chmodSync('tasks', 0777);
  });
}
