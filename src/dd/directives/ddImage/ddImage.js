/**
 * @requires dd.$ddImage
 * @requires dd.$ddLoading
 * @requires dd.$ddPopup
 * @requires dd.directive:ddImage:ddImage.css
 *
 * @ngdoc directive
 * @name dd.directive:ddImage
 * @function
 *
 * @description
 * Просмотр картинки. Пример использования можно посмотреть {@link api/dd.directive:ddGallery в ddGallery}.
 *
 * @element A
 * @param {Object} ddImageSize Размеры картинки `{width: Integer, height: Integer}`.
 * @param {String} href URI картинки.
 */

defineDirective('ddImage', ["$ddImage", '$ddPopup', '$compile', '$rootScope', '$parse', '$ddLoading', '$timeout', function(ddImage, ddPopup, $compile, $rootScope, $parse, ddLoading, $timeout){
    var $ = angular.element,
        popupGalleryTpl = $compile($(
            '<div class="dd-b-modalimage">' +
                '<div ng-mousemove="updateZoom($event)" ng-show="showZoomIn" ng-click="zoomOut()" class="dd-c-zoomin"></div>' +
                '<div ng-hide="showZoomIn" class="dd-c-image-hh">' +
                    '<div class="dd-c-image-h">' +
                        '<img ng-click="zoomIn($event)" class="dd-c-img"  style="width:{{size.width}}px;height:{{size.height}}px;" ng-src="{{src}}" />' +
                    '</div>' + 
                '</div>' +
                '<p class="dd-c-title">{{title}}</p>' +
            '</div>'
        ));
    return {
        compile: function(tElement, tAttrs){
            return function(scope, iElement, iAttrs){
                iElement.on('click', function(e){
                    e.preventDefault();
                    var imgSize = scope.$eval(iAttrs.ddImageSize),
                        imgVolume = imgSize.width * imgSize.height,
                        size = optimateViewSize(ddPopup.getViewSize()),
                        src = ddImage.getSrc(iAttrs.href, imgSize, size),
                        srcSize = ddImage.getSize(imgSize, size),
                        calcSize = calculateSize(srcSize, size);
                                              
                    var popup = ddPopup({
                        mod: 'image' + (iAttrs.title ? ' has_title' : ''),
                        content: {
                            template: '',
                            width: calcSize.width, 
                            height: calcSize.height
                        },
                        loader: function(done){
     
                             $(new Image())
                                .attr("src", src)
                                .load(function(){ 
                                    var scope = $rootScope.$new();
                                    
                                    scope.popup = popup;
                                    scope.originalSrc = iAttrs.href;
                                    scope.originalSize = imgSize;
                                    scope.src = src;
                                    scope.title = iAttrs.title;
                                    scope.size = calcSize;
                                    scope.zoomOut = function(){
                                        zoomOut.call(scope);
                                    };
                                    scope.zoomIn = function(e){
                                        zoomIn.call(scope, e);
                                    };
                                    scope.updateZoom = function(e){
                                        updateZoom.call(scope, e);
                                    }
                                        
                                    popupGalleryTpl(scope, function(el){
                                        scope._el = el;
                                        if(imgVolume / (calcSize.width * calcSize.height) > 1.1) {
                                            el.addClass('mod_zoom');
                                        } else {
                                            scope.zoomIn = nullFn
                                        }
                                        done({el: el, width: calcSize.width, height: calcSize.height});
                                    });
                                    scope.$digest();
                                });

                         }
                    });
                });
            };
        }
    };
    function nullFn(){
    }
    function zoomIn(e){       
        if(this._inZoom) return;
      
        this._inZoom = true;
               
        var scope = this,
            viewSize = ddPopup.getViewSize(),
            loadingDone = function(){
                loadingDone = true;
            };
            
        scope._zoomReady = false;
     
        $(new Image())
            .attr('src', scope.originalSrc)
            .load(function(){
              
                scope._zoomReady = true;
              
                loadingDone();
                    
                scope.showZoomIn = true;
                scope._zoomEl = scope._el
                    .addClass('mod_inzoom')
                    .find('.dd-c-zoomin');                    
                    
                scope.popup.setSize({
                    width: Math.min(viewSize.width, this.width),
                    height: Math.min(viewSize.height, this.height)
                });
                    
                updateZoom.call(scope, e);
                        
                scope.$digest();
            });
   
        $timeout(function(){
            if(loadingDone === true) return;
            loadingDone = ddLoading(scope._el, scope, {
                mod: 'transparent'
            });
        }, 500);
    }
    function zoomOut(){
            
        if(!this._zoomReady || !this._inZoom) return;
            
        this._inZoom = false;
        
        var scope = this;
        scope._zoomEl.css('background-image', 'none');
        scope.showZoomIn = false;
        scope.popup.setSize(scope.size);
    }
    function updateZoom(e){
        
        var scope = this,
            originalSize = scope.originalSize,
            zoomOffset = scope._zoomEl.offset(),
            zoomEl = scope._zoomEl,
            zoomSize = {
                width: parseInt(zoomEl.css('width')),
                height: parseInt(zoomEl.css('height'))
            },
            marginW = zoomSize.width * 0.15,
            marginH = zoomSize.height * 0.15,
            offset,
            width,
            height;

        offset = Math.max(0, e.pageX - zoomOffset.left - marginW);
        offset = Math.min(offset, zoomSize.width - 2 * marginW);
        width = - Math.round(offset * (originalSize.width - zoomSize.width )/(zoomSize.width - marginW * 2) ) + "px";
        offset = Math.max(0, e.pageY - zoomOffset.top - marginH);
        offset= Math.min(offset, zoomSize.height - 2 * marginH);
        height = - Math.round(offset * (originalSize.height - zoomSize.height)/ (zoomSize.height - 2 * marginH) ) + "px";
        zoomEl.css({
            'background-position': width + ' ' + height,
            'background-image': 'url(' + scope.originalSrc + ')'
        });           
    }
    function calculateSize(originalSize, viewSize){
        var ratio = originalSize.width / originalSize.height,
            height = viewSize.width / ratio <= viewSize.height ? viewSize.width / ratio : viewSize.height,
            width = height * ratio,
            volume = width * height,
            volumeOriginal = originalSize.width * originalSize.height;
          
        if(volume > 2 * volumeOriginal){
            var k = Math.sqrt(2);
            width = originalSize.width * k;
            height = originalSize.height * k;
        }            
        return {
            width: parseInt(width),
            height: parseInt(height)
        };
    }        
    function optimateViewSize(viewSize){
        return {
            width: Math.max(viewSize.width, 500),
            height: Math.max(viewSize.height, 500)
        };
    }
}]);
