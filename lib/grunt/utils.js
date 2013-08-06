var fs = require('fs');
var shell = require('shelljs');
var grunt = require('grunt');
var spawn = require('child_process').spawn;
var versionDD;
var versionNG;

module.exports = {

  init: function() {
    shell.exec('npm install');
  },

  getVersionDD: function(){
    if (versionDD) return versionDD;
    var versionDD = this.getVersion('package.json');
    return versionDD;
  },
  
  getVersionNG: function(){
    if (versionNG) return versionNG;
    var versionNG = this.getVersion('./components/angularjs/package.json');
    return versionNG;
  },  
  
  getVersion: function(packageFile){
  
    var package = JSON.parse(fs.readFileSync(packageFile, 'UTF-8'));
    var match = package.version.match(/^([^\-]*)(-snapshot)?$/);
    var semver = match[1].split('.');
    var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');

    var fullVersion = (match[1] + (match[2] ? '-' + hash : ''));
    var numVersion = semver[0] + '.' + semver[1] + '.' + semver[2];
    var version = {
      hash: hash,
      number: numVersion,
      full: fullVersion,
      major: semver[0],
      minor: semver[1],
      dot: semver[2],
      codename: package.codename,
      cdn: package.cdnVersion
    };

    return version;
  },
  
  wrapNG: function(src, name){
    src.unshift('components/angularjs/src/' + name + '.prefix');
    src.push('components/angularjs/src/' + name + '.suffix');
    return src;
  },

  addStyle: function(src, styles, minify){
    styles = styles.map(processCSS.bind(this)).join('\n');
    src += styles;
    return src;

    function processCSS(file){
      var css = fs.readFileSync(file).toString();
      if(minify){
        css = css
          .replace(/\r?\n/g, '')
          .replace(/\/\*.*?\*\//g, '')
          .replace(/:\s+/g, ':')
          .replace(/\s*\{\s*/g, '{')
          .replace(/\s*\}\s*/g, '}')
          .replace(/\s*\,\s*/g, ',')
          .replace(/\s*\;\s*/g, ';');
      }
      //escape for js
      css = css
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, '\\n');
      return "angular.element(document).find('head').append('<style type=\"text/css\">" + css + "</style>');";
    }
  },


  process: function(src, VERSION, strict){
    var processed = src
      .replace(/"NG_VERSION_FULL"/g, VERSION.full)
      .replace(/"NG_VERSION_MAJOR"/, VERSION.major)
      .replace(/"NG_VERSION_MINOR"/, VERSION.minor)
      .replace(/"NG_VERSION_DOT"/, VERSION.dot)
      .replace(/"NG_VERSION_CDN"/, VERSION.cdn)
      .replace(/"NG_VERSION_CODENAME"/, VERSION.codename);
    if (strict !== false) processed = this.singleStrict(processed, '\n\n', true);
    return processed;
  },


  build: function(config, fn){
    var files = grunt.file.expand(config.src);
    var styles = config.styles;
    //concat
    var src = files.map(function(filepath){
      return grunt.file.read(filepath);
    }).join(grunt.util.normalizelf('\n'));
    //process
    var processed = this['process' + config.process](src, grunt.config(config.process + '_VERSION'), config.strict);
    if (styles) processed = this.addStyle(processed, styles.css, styles.minify);
    //write
    grunt.file.write(config.dest, processed);
    grunt.log.ok('File ' + config.dest + ' created.');
    fn();
  },


  singleStrict: function(src, insert){
    return src
      .replace(/\s*("|')use strict("|');\s*/g, insert) // remove all file-specific strict mode flags
      .replace(/(\(function\([^)]*\)\s*\{)/, "$1'use strict';"); // add single strict mode flag
  },


  sourceMap: function(mapFile, fileContents) {
    // use the following once Chrome beta or stable supports the //# pragma
    // var sourceMapLine = '//# sourceMappingURL=' + mapFile + '\n';
    var sourceMapLine = '/*\n//@ sourceMappingURL=' + mapFile + '\n*/\n';
    return fileContents + sourceMapLine;
  },


  min: function(file, done) {
    var classPathSep = (process.platform === "win32") ? ';' : ':';
    var minFile = file.replace(/\.js$/, '.min.js');
    var mapFile = minFile + '.map';
    var mapFileName = mapFile.match(/[^\/]+$/)[0];
    var errorFileName = file.replace(/\.js$/, '-errors.json');
    shell.exec(
        'java ' +
            this.java32flags() + ' ' +
            '-Xmx2g ' +
            '-cp components/closure-compiler/compiler.jar' + classPathSep +
            'components/ng-closure-runner/ngcompiler.jar ' +
            // '-classpath ./components/closure-compiler/compiler.jar' + classPathSep +
            // './components/ng-closure-runner/ngcompiler.jar ' +
            'org.angularjs.closurerunner.NgClosureRunner ' +
            '--compilation_level SIMPLE_OPTIMIZATIONS ' +
            '--language_in ECMASCRIPT5_STRICT ' +
            '--minerr_pass ' +
            '--minerr_errors ' + errorFileName + ' ' +
            '--minerr_url http://docs.angularjs.org/minerr/ ' +
            '--source_map_format=V3 ' +
            '--create_source_map ' + mapFile + ' ' +
            '--js ' + file + ' ' +
            '--js_output_file ' + minFile,
      function(code) {
        if (code !== 0) grunt.fail.warn('Error minifying ' + file);

        // closure creates the source map relative to build/ folder, we need to strip those references
        var mapDir = mapFile.replace(/\/[^\/]+$/,"/"); 
        grunt.file.write(mapFile, grunt.file.read(mapFile).replace('"file":"' + mapDir, '"file":"').
                                                           replace('"sources":["' + mapDir,'"sources":["'));

        // move add use strict into the closure + add source map pragma
        grunt.file.write(minFile, this.sourceMap(mapFileName, this.singleStrict(grunt.file.read(minFile), '\n')));
        grunt.log.ok(file + ' minified into ' + minFile);
        done();
    }.bind(this));
  },


  //returns the 32-bit mode force flags for java compiler if supported, this makes the build much faster
  java32flags: function(){
    if (process.platform === "win32") return '';
    if (shell.exec('java -version -d32 2>&1', {silent: true}).code !== 0) return '';
    return ' -d32 -client';
  },


  //collects and combines error messages stripped out in minify step
  collectErrors: function () {
    var combined = {
      id: 'ng',
      generated: new Date().toString(),
      errors: {}
    };
    grunt.file.expand('build/**/*-errors.json').forEach(function (file) {
      var errors = grunt.file.readJSON(file),
        namespace;
      Object.keys(errors).forEach(function (prop) {
        if (typeof errors[prop] === 'object') {
          namespace = errors[prop];
          if (combined.errors[prop]) {
            Object.keys(namespace).forEach(function (code) {
              if (combined.errors[prop][code] && combined.errors[prop][code] !== namespace[code]) {
                grunt.warn('[collect-errors] Duplicate minErr codes don\'t match!');
              } else {
                combined.errors[prop][code] = namespace[code];
              }
            });
          } else {
            combined.errors[prop] = namespace;
          }
        } else {
          if (combined.errors[prop] && combined.errors[prop] !== errors[prop]) {
            grunt.warn('[collect-errors] Duplicate minErr codes don\'t match!');
          } else {
            combined.errors[prop] = errors[prop];
          }
        }
      });
    });
    grunt.file.write('build/errors.json', JSON.stringify(combined));
    grunt.file.expand('build/**/*-errors.json').forEach(grunt.file.delete);
  },

  parallelTask: function(name) {
    var args = [name, '--port=' + this.lastParallelTaskPort];

    if (grunt.option('browsers')) {
      args.push('--browsers=' + grunt.option('browsers'));
    }

    if (grunt.option('reporters')) {
      args.push('--reporters=' + grunt.option('reporters'));
    }

    this.lastParallelTaskPort++;


    return {grunt: true, args: args};
  },

  lastParallelTaskPort: 9876
};