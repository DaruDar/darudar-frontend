var path = require('path');
var fs = require('fs');
var utils = require('../utils.js');
var crypto = require('crypto');
var qfs = require('q-fs');

module.exports = function(grunt) {
  grunt.registerTask('buildmodules', 'Выстраивание зависимостей и сборка', function(){
    
    var config = grunt.config(this.name + '.' + this.args[0]);
    
    var tempDir = path.dirname(config.buildDir) + '/_' + new Date().getTime();
    var doneTask = this.async();

    try {
        build(tempDir, config, doneTask);
    } catch (e) {
        grunt.file.delete(tempDir, {force: true});
        throw e;
    }
        
  });
  function build(tempDir, config, doneTask){
  
    var requireRegex = /@requires\s+([^\n]+)\n/g;
    var componentsDir = tempDir + '/components';
    
    grunt.file.mkdir(componentsDir);
    
    // Сборка библиотеки
    var libs = {};  

    grunt.file.expand(config.lib).forEach(function(file){
        var content = grunt.file.read(file);
        var requires = content.match(requireRegex);
        var name = /@name\s+([^\s]+)/.exec(content)[1];
        var module = /^(\w+)\./.exec(name);
        var lib = {
            _requires: requires || [],
            src: file
        };
        if(module) lib._requires.push('@requires ' + module[1] + '\n');
        if(name){
            libs[name] = lib;
        }
    });    

    grunt.util.async.forEach(config.main, function(main, done){
        
        if (typeof main == 'string'){
            main = {
                name: main
            }
        }
        
        // Выстраивание зависимостей        
        var stack = [];
        var files = [];
        
        if(libs[main.name]) stack.push(libs[main.name]);

        var current;
        while(stack.length > 0){
            current = stack[stack.length - 1];
            if(!current.requires) current.requires = current._requires.slice(0);
            if(current.requires.length > 0){
                requireRegex.lastIndex = 0;
                var requireItem = current.requires.shift();
                var require = requireRegex.exec(requireItem)[1];
                if(require == '*') {
                    addAllLibs(libs, current);
                } else if (libs[require] && stack.indexOf(libs[require]) < 0){
                    stack.push(libs[require]);
                } else {
                    var component = findComponent(require, config.components, libs);                  
                    if(files.indexOf(component) < 0) {
                        files.push(component);
                    }
                }
            } else {
                delete current.requires;
                stack.pop();
                if(files.indexOf(current.src) < 0) {
                    files.push(current.src);
                }
            }        
        }
        
        // Сборка файлов
        var minCssContent = '';
        var cssContent = '';
        var minJsContent = '';
        var jsContent = '';   
        var cssHash = '';
        var jsHash = ''; 
        var jsList = [];
        var cssList = [];
        var minJsList = [];
        var minCssList = [];
        var map = {
            js: [], css: []
        };
        
        grunt.file.expand(files).forEach(function(file){
            if(file.indexOf('.css') > 0){
                var minFile = file.replace('.css','.min.css');
                if(grunt.file.exists(minFile)) {
                    minCssContent += grunt.file.read(minFile);            
                    cssHash += minFile + fs.statSync(minFile).mtime.getTime();
                    minCssList.push(file);
                } else {
                    cssContent += grunt.file.read(file);
                    cssList.push(file);
                }            
            } else if(file.indexOf('.js') > 0) {
                var minFile = file.replace('.js','.min.js');
                if(grunt.file.exists(minFile)) {
                    minJsContent += grunt.file.read(minFile);
                    jsHash += minFile + fs.statSync(minFile).mtime.getTime();
                    minJsList.push(file);
                } else {
                    jsContent += grunt.file.read(file);
                    jsList.push(file);
                }
            }        
        });
        
        grunt.log.ok(" ");
        grunt.log.ok("Build:");
        grunt.util._.forEach(files, function(file){
            grunt.log.ok(file);
        });        
        
        // Минимизация и обвертка CSS
        cssContent = makeCss(cssContent, main.separateCss);
        minCssContent = makeCss(minCssContent, main.separateCss);
        
        // Минимизация JS
        var libDir = tempDir + '/' + main.name;
        var version = utils.getVersion('package.json');
        grunt.file.mkdir(libDir);
        var file = libDir + "/" + main.name + '-v' + version.full + '-' + version.hash;
        
        if(main.separateCss){
            var hashJs = crypto.createHash('md5').update(jsHash).digest("hex");
            var hashCss = crypto.createHash('md5').update(cssHash).digest("hex");
            
            var componentFileJs = componentsDir + "/" + hashJs + ".js";
            var componentFileCss = componentsDir + "/" + hashCss + ".css";
            
            grunt.file.write(componentFileJs, minJsContent);
            grunt.file.write(componentFileCss, minCssContent);
            
            grunt.file.write(file + '.js', ';(function(){' + jsContent + '})();');
            grunt.file.write(file + '.css', cssContent); 
            
            qfs.symbolicLink(libDir + '/components.' + hashJs + '.js', '../components/' + path.basename(componentFileJs), 'dir');
            qfs.symbolicLink(libDir + '/components.' + hashCss + '.css', '../components/' + path.basename(componentFileCss), 'dir');
   
            map.css.push({
                'src': config.buildDir + componentFileCss.replace(tempDir, ''),
                'files': minCssList
            });
            map.css.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.css',
                'files': cssList
            });
            map.js.push({
                'src': config.buildDir + componentFileJs.replace(tempDir, ''),
                'files': minJsList
            });
            map.js.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.js',
                'files': jsList
            });            
            
        } else {
            var hash = crypto.createHash('md5').update(jsHash + cssHash).digest("hex");
            
            var componentFile = componentsDir + "/" + hash + ".js";
            
            grunt.file.write(file + '.js', ';(function(){' + jsContent + '})();' + cssContent); 
            grunt.file.write(componentFile, minJsContent + minCssContent);            
            qfs.symbolicLink(libDir + '/components.' + hash + '.js', '../components/' + path.basename(componentFile), 'dir');
            
            map.js.push({
                'src': config.buildDir + componentFile.replace(tempDir, ''),
                'files': minJsList.concat(minCssList)
            });
            map.js.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.js',
                'files': jsList.concat(cssList)
            });
        }
        
        grunt.file.write(file + '.map', JSON.stringify(map, null, 4));
        
        utils.min(file + '.js', function(){
            done();
        });
            
    }, function(){
        utils.collectErrors();
        
        if(grunt.file.exists(config.buildDir)) {
            grunt.file.delete(config.buildDir, {force: true});
        }
        
        fs.renameSync(tempDir, config.buildDir);
             
        doneTask();
    });   
  
  }
  function addAllLibs(libs, toLib){
    var requires = [];
    grunt.util._.forEach(libs, function(lib, name){
        if(lib != toLib) requires.push('@requires ' + name + "\n");
    });
    toLib.requires = requires.concat(toLib.requires);
  }
  function makeCss(cssContent, isSeparate){
    cssContent = cssContent
      .replace(/\r?\n/g, '')
      .replace(/\/\*.*?\*\//g, '')
      .replace(/:\s+/g, ':')
      .replace(/\s*\{\s*/g, '{')
      .replace(/\s*\}\s*/g, '}')
      .replace(/\s*\,\s*/g, ',')
      .replace(/\s*\;\s*/g, ';');

    if(isSeparate) return cssContent;

    cssContent = cssContent
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, '\\n');
    
    return "angular.element(document).find('head').append('<style type=\"text/css\">" + cssContent + "</style>');";
  }
  function findComponent(name, components, libs){
    var relativeIndex = name.lastIndexOf(':');
    if(relativeIndex > 0){
        var relativeFile = name.substr(relativeIndex + 1);
        var relativeName = name.substr(0, relativeIndex);
        return libs[relativeName] ? path.dirname(libs[relativeName].src) + '/' +  relativeFile: null;
    } else {
        var component;
        grunt.util._.forEach(components, function(lib){    
            component = grunt.file.expand(lib + '/' + name);
            if(component.length > 0 ) return false;
        });
        return component[0]; 
    }   
  } 
};
