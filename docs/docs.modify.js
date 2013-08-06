docsApp.directive.sourceEdit = function(getEmbeddedTemplate) {
  return {
    template: '<div class="btn-group pull-right">' +
        '<a class="btn dropdown-toggle btn-primary" data-toggle="dropdown" href>' +
        '  <i class="icon-pencil icon-white"></i> Edit<span class="caret"></span>' +
        '</a>' +
        '<ul class="dropdown-menu">' +
        '  <li><a ng-click="plunkr($event)" href="">In Plunkr</a></li>' +
        '</ul>' +
        '</div>',
    scope: true,
    controller: function($scope, $attrs, openJsFiddle, openPlunkr) {
      var sources = {
        module: $attrs.sourceEdit,
        deps: read($attrs.sourceEditDeps),
        html: read($attrs.sourceEditHtml),
        css: read($attrs.sourceEditCss),
        js: read($attrs.sourceEditJs),
        unit: read($attrs.sourceEditUnit),
        scenario: read($attrs.sourceEditScenario)
      };
      $scope.fiddle = function(e) {
        e.stopPropagation();
        openJsFiddle(sources);
      };
      $scope.plunkr = function(e) {
        e.stopPropagation();
        openPlunkr(sources);
      };
    }
  }

  function read(text) {
    var files = [];
    angular.forEach(text ? text.split(' ') : [], function(refId) {
      // refId is index.html-343, so we need to strip the unique ID when exporting the name
      files.push({name: refId.replace(/-\d+$/, ''), content: getEmbeddedTemplate(refId)});
    });
    return files;
  }
};
docsApp.serviceFactory.openPlunkr = function(templateMerge, formPostData, angularUrls) {
  var deps = [];
  $('[docsdep]').each(function(){
    deps.push(this.src || this.href);
  });
  return function(content) {
    var allFiles = [].concat(content.js, content.css, content.html);
    var indexHtmlContent = '<!doctype html>\n' +
        '<html ng-app="' + content.module + '">\n' +
        '  <head>\n' +
        '    <meta charset="utf-8"/>\n' +
        '{{scriptDeps}}\n' +
        '  </head>\n' +
        '  <body><div class="well">\n\n' +
        '{{indexContents}}' +
        '\n\n  </div></body>\n' +
        '</html>\n';
    var scriptDeps = '';
    angular.forEach(content.deps, function(file) {
      if (file.name !== 'angular.js') {
        scriptDeps += '    <script src="' + file.name + '"></script>\n'
      }
    });
    angular.forEach(deps, function(file) {
      if (file.indexOf('.js') > 0) {
        scriptDeps += '    <script src="' + file + '"></script>\n';
      } else if (file.indexOf('.css') > 0 ){
        scriptDeps += '    <link href="' + file + '" rel="stylesheet" type="text/css"/>\n';
      }
    });
    var postData = {};
    angular.forEach(allFiles, function(file, index) {
      if (file.content && file.name != 'index.html') {
        if(file.name.indexOf('.css') > 0) {
            scriptDeps = '    <link href="'+ file.name +'" rel="stylesheet" type="text/css"/>\n' + scriptDeps;
        }
        postData['files[' + file.name + ']'] = file.content;    
      }
    });
    indexProp = {
      angularJSUrl: angularUrls['angular.js'],
      scriptDeps: scriptDeps,
      indexContents: content.html[0].content
    };
    postData['files[index.html]'] = templateMerge(indexHtmlContent, indexProp);
    postData['tags[]'] = "angularjs";
    
    postData.private = true;
    postData.description = 'DaruDar Example Plunkr';

    formPostData('http://plnkr.co/edit/?p=preview', postData);
  };
};
