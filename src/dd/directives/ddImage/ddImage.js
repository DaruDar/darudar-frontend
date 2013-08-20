/**
 * @requires dd.$ddImage
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
 * @param {Object} ddImageSize Размеры картинки `{width: Integer, height: Integer}`
 * @param {String} href URI картинки
 * @param {String=} title Комментарий
 */

defineDirective('ddImage', ["$ddImage", '$ddPopup', '$compile', '$rootScope', '$parse', '$ddLoading', '$timeout', '$window', function(ddImage, ddPopup, $compile, $rootScope, $parse, ddLoading, $timeout, $window){

    var WHEEL_STEP = 1.2;  // Коэфф. масштабирования при скроле мышью
    var MAX_VOLUME_RATIO = 4; // Максимальный коэфф. масштабирования относительно оригинальных размеров изображения

    var $ = angular.element,
        popupGalleryTpl = $compile($(
            '<div ng-click="onMaskClick($event)" class="dd-b-modalimage">' +
                '<div ng-mousedown="onMouseDown($event)" msd-wheel="onMouseWheel($event, $delta, $deltaX, $deltaY)" class="dd-c-img" style="width:{{viewSize.width}}px;height:{{viewSize.height}}px;">' +
                    '<img ng-src="{{src}}" style="top:{{offset.top}}px;left:{{offset.left}}px;width:{{size.width}}px;height:{{size.height}}px;" />' +
                '</div>' +
            '</div>'
        ));
    return {
        compile: function(tElement, tAttrs){
            return function(scope, iElement, iAttrs){
                iElement.on('click', function(e){
                    e.preventDefault();
                    var $ = angular.element,
                        imgSize = scope.$eval(iAttrs.ddImageSize),
                        ratio = imgSize.width / imgSize.height,
                        windowSize = ddPopup.getViewSize('fit'),
                        src = ddImage.getSrc(iAttrs.href, imgSize, windowSize),
                        srcSize = ddImage.getSize(imgSize, windowSize),
                        calcSize = calculateSize(srcSize, windowSize);
                                              
                    var popup = ddPopup({
                        mod: 'fit',
                        title: iAttrs.title,
                        loader: function(done){

                             $(new Image())
                                .attr("src", src)
                                .load(function(){ 
                                    var scope = $rootScope.$new();
                                    
                                    scope.isLoaded = iAttrs.href == src;
                                    scope.popup = popup;
                                    scope.originalSrc = iAttrs.href;
                                    scope.originalSize = imgSize;
                                    scope.src = src;
                                    scope.size = calcSize;
                                    scope.viewSize = calcSize;
                                    scope.offset = {
                                        top: 0,
                                        left: 0
                                    };
                                    scope.onMaskClick = function(e){
                                        if($(e.target).is('.dd-b-modalimage')) {
                                            popup.close();
                                        }
                                        
                                    };
                                    
                                    var dragData = {};
                                    var dragEvents = {
                                        'mouseup': function(e){
                                            $($window).off(dragEvents);
                                            scope._viewEl.removeClass('state_move');
                                        },
                                        'mousemove': function(e){
                                            e.preventDefault();
                                            scope.$apply(function(){
                                                scope.offset = optimateOffset.call(scope, {
                                                    top: dragData.startOffset.top + (e.pageY - dragData.startEvent.pageY),
                                                    left: dragData.startOffset.left + (e.pageX - dragData.startEvent.pageX),
                                                })
                                            });
                                        }
                                    };
                                    
                                    scope.onMouseDown = function(e){
                                        if(scope.viewSize.width >= scope.size.width && scope.viewSize.height >= scope.size.height) return;
                                        e.preventDefault();
                                        dragData.startEvent = e;
                                        dragData.startOffset = scope.offset;
                                        scope._viewEl.addClass('state_move');
                                        $($window).on(dragEvents);
                                    }
                                    
                                    scope.onMouseWheel = function(e, delta, deltaX, deltaY){
                                        if(!scope.isLoaded) {
                                            loadOriginal.call(scope);
                                        }
                                        var event = e.originalEvent;
                                        var viewOffset = scope._viewEl.offset();
                                        var viewSize = scope.viewSize;
                                        var position = {
                                            top: (event.pageY - viewOffset.top - scope.offset.top) / scope.size.height,
                                            left: (event.pageX - viewOffset.left - scope.offset.left) / scope.size.width
                                        }; 

                                        var width = width = Math.round(
                                            Math.min(
                                                Math.sqrt(MAX_VOLUME_RATIO) * imgSize.width, 
                                                Math.max(scope.size.width * (delta > 0 ? WHEEL_STEP : 1 / WHEEL_STEP ), calcSize.width)
                                            )
                                        );
                                        var height = Math.round(width / ratio);
                                        
                                        scope.size = {
                                            width: width,
                                            height: height
                                        };
                                        
                                        scope.viewSize = {
                                            width: Math.min(width, windowSize.width),
                                            height: Math.min(height, windowSize.height)
                                        }
                                        viewOffset.left -= (scope.viewSize.width - viewSize.width) / 2;
                                        viewOffset.top -= (scope.viewSize.height - viewSize.height) / 2;
                                        scope.offset = getOffset.call(scope, event, position, viewOffset);

                                    }
                                    popupGalleryTpl(scope, function(el){
                                        scope._el = el;
                                        scope._viewEl = el.find('.dd-c-img');
                                        done({el: el});
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
    function loadOriginal(){
        var scope = this;
        scope.isLoaded = true;
        $(new Image())
            .attr("src", scope.originalSrc)
            .load(function(){
                scope.src = scope.originalSrc;
                scope.$digest();
            });
    }
    function getOffset(e, position, viewOffset){
        var size = this.size;
        var offset = this.offset;
        var eventOffsetX = e.pageX - viewOffset.left;
        var eventOffsetY = e.pageY - viewOffset.top;
        var left = Math.round(position.left * size.width - eventOffsetX);
        var top = Math.round(position.top * size.height - eventOffsetY);
        
        return optimateOffset.call(this, { 
            left: -left,
            top: -top
        });
        
    }
    function optimateOffset(offset){
        var viewSize = this.viewSize;
        var size = this.size;
        
        return {
            left: -Math.max(0,Math.min(-offset.left, size.width - viewSize.width)),
            top: -Math.max(0,Math.min(-offset.top, size.height - viewSize.height))
        }
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
