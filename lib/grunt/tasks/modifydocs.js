var path = require('path');
module.exports = function(grunt) {
  grunt.registerTask('modifydocs', 'modify angular docs', function(){
      
      var componentJS = '';      
      var ddDocsMap = JSON.parse(grunt.file.read(grunt.file.expand('build/docs/modules/ddDocs/*.map','!build/docs/modules/ddDocs/*.min.js.map')[0]));
      
      grunt.util._.forEach(ddDocsMap.js, function(files){
        grunt.util._.forEach(files.files, function(file){
            if(file.indexOf('.js') > 0){
                componentJS += "addTag('script', {docsdep: true, src: '" + file.replace(/build\//g,'') + "'}, sync);\n";
            } else {
                componentJS += "addTag('link', {docsdep: true, rel: 'stylesheet', href: '" + file.replace(/build\//g,'') + "', type: 'text/css'});";
            }
            
        });
      });
      grunt.file.expand('build/docs/partials/**/*.html').forEach(function(file){
        grunt.file.write(file, grunt.file.read(file)
            .replace(/github.com\/angular\/angular\.js/g, 'github.com/darudar/darudar-frontend')
            .replace(/api\/ng\./g,'api/')
            .replace(/<a href="api\/\w+.*?:\w+\.\w+">(.*?)<\/a>/g,'$1')
            .replace(/<a href="api\/\w+\/.*?">(.*?)<\/a>/g,'$1')
        );
      });
      grunt.file.write('build/docs/appDocs.js', grunt.file.read('build/docs/js/docs.js')
        .replace('angular.module', grunt.file.read('docs/docs.modify.js') + '\nangular.module')
        .replace('angularjs.disqus', 'darudar.disqus')
        .replace('docs.angularjs.org', 'dev.darudar.org')
        .replace('angularjs-next', 'devdarudar')
        .replace('$window._gaq', '//$window._gaq')
      );
      grunt.file.expand('build/docs/*.html','build/docs/*.ico','build/docs/*.manifest','build/docs/robots.txt','build/docs/sitemap.xml').forEach(function(file){
        grunt.file.delete(file);
      });
      grunt.file.expand('docs/templates/*').forEach(function(file){
        grunt.file.copy(file, 'build/docs/' + path.basename(file));
      });
      
      grunt.file.expand('build/docs/index*.html').forEach(function(file){
        grunt.file.write(file, 
            grunt.file.read(file)
                .replace('{deps}', componentJS)
        );
      });    
  });
}
