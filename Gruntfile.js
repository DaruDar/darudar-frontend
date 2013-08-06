var util = require('./lib/grunt/utils.js');

module.exports = function(grunt) {

  var DD_VERSION = util.getVersionDD();

  //grunt plugins
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadTasks('lib/grunt/tasks');

  //config
  grunt.initConfig({
  
    DD_VERSION: DD_VERSION,

    buildmodules: {
        app: {
            main: ['dd', 'ddDocs'],
            lib: ['src/**/*.js'],
            components: ['build/components'],
            buildDir: 'build/modules'
        },
        docs: {
            main: ['ddDocs'],
            lib: ['src/**/*.js'],
            components: ['build/components'],
            buildDir: 'build/docs/modules'          
        }
    },
    shell: {
      init: {
        command: 'bower --config.directory=components install',
        options: {
            stdout: true
        }        
      },
      angular: {
        command: '(cd components/angularjs; npm install; grunt)',
        options: {
            stdout: true
        }        
      },
      bootstrap: {
        command: '(cd components/bootstrap; npm install; grunt)',
        options: {
            stdout: true
        }        
      }    
    }    
  });

  grunt.registerTask('collect-errors', 'Combine stripped error files', function () {
    util.collectErrors();
  }); 

  //alias tasks
  grunt.registerTask('package', ['initcomponents', 'shell', 'docs']);
  grunt.registerTask('app', ['buildmodules:app']);
  grunt.registerTask('docs', ['builddocs', 'buildmodules:docs', 'modifydocs']);
  grunt.registerTask('default', ['package']);
};
