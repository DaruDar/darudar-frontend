/**
 * @requires dd.$ddLoading
 * @requires dd.$ddPopup:ddPopup.css
 *
 * @ngdoc function
 * @name dd.$ddPopup
 * @function
 *
 * @description
 * Служба $ddPopup предназначена для создания попапов.
 *
 * @param {object} options Конфигурация попапа. Параметры:
 *
 *   * `{function=}` `loader` — Функция загрузчика
 *      <pre>
         function(done){ 
          ...Load content...
          done(content);
         }
 *      </pre>
 *   * `{string=}` `title` — Заголовок
 *   * `{string=}` `mod` — Модификация
 *   * `{object=}` `content` — Содержимое окна. Параметры:
 *      * `{string=}` `template` [default] '' — Шаблон контента
 *      * `{jQuery element=}` `el` — Элемент, который будет использован под контент вместо шаблона
 *      * `{string|integer=}` `width` [default] `$($window).width() / 2` — Ширина окна
 *      * `{string|integer=}` `height` [default] 'auto' — Высота окна 
 * 
 * @return {object} Экземпляр попапа
 */
defineFactory('$ddPopup', ['$rootScope', '$q', '$locale', '$compile', '$animator','$timeout','$window','$ddLoading', function($rootScope, $q, $locale, $compile, $animator, $timeout, $window, ddLoading){
    var popups = [],
        $ = angular.element,
        notLoadedTpl = "<p>" + $locale.loadingFail + "</p>",
        bodyEl = angular.element('body'),
        popupTpl =  $compile(angular.element(
            '<div ng-click="onMaskClick($event)" class="dd-b-popup state_active" ng-animate="{enter:\'dd-a-fade-enter\', leave:\'dd-a-fade-leave\'}">' +
                '<div class="dd-b-popup-h">' +
                    '<div class="dd-b-popup-hh">' +
                        '<div class="modal _c{{$id}}">' +
                            '<div class="modal-header" ng-class="title ? \'\' : \'mod_notitle\'">' +
                                '<button ng-click="close()" type="button" class="close">×</button>' +
                                '<h3>{{title}}</h3>' +
                             '</div>' +
                             '<div class="modal-body">' +
                                '<div class="dd-b-popup-content _c{{$id}}" style="width:{{width}};height:{{height}};"></div>' +
                             '</div>' +
                        '</div>' + 
                    '</div>' +     
                '</div>' +    
            '</div>'
        ));
    
    ddPopup.prototype = {
        loader: null,
        title: null,
        mod: 'default',
        content: {
            template: '',
            el: null,
            height: 'auto',
            width: $($window).width() / 2
        },
        /**
         * @ngdoc function
         * @name dd.ddPopup#setSize
         * @methodOf dd.$ddPopup
         * @function
         *
         * @description
         * Устанавливает размер окна
         *
         * @param {object} size Размеры окна {width: integer|string, height: integer|string}
         */        
        setSize: setSize,   
        /**
         * @ngdoc function
         * @name dd.ddPopup#setLoader
         * @methodOf dd.$ddPopup
         * @function
         *
         * @description
         * Инициализирует загрузчик
         *
         * @param {function} loader Функция загрузчика
         */                 
        setLoader: setLoader,
        /**
         * @ngdoc function
         * @name dd.ddPopup#open
         * @methodOf dd.$ddPopup
         * @function
         *
         * @description
         * Показать попап
         *
         */         
        open: open,
        /**
         * @ngdoc function
         * @name dd.ddPopup#`close
         * @methodOf dd.$ddPopup
         * @function
         *
         * @description
         * Закрыть попап
         */         
        close: close
    };  
    /**
     * @ngdoc function
     * @name dd.ddPopup#getViewSize
     * @methodOf dd.$ddPopup
     * @function
     *
     * @description
     * **static** Возвращает максимальные размеры контента, при условии, что попап без скрола вписан в размеры окна.
     *
     * @return {object} Размеры контента {width: integer, height: integer}
     */
    constructPopup.getViewSize = function(){
        return {
            width: $($window).width() - 60,
            height: $($window).height() - 65
        };
    }
    return constructPopup;
    
    function constructPopup(options){
        return new ddPopup(options).open();
    }
    function ddPopup(cfg){
        var self = this,
            scope = this.scope = $rootScope.$new();
          
        angular.extend(this, cfg);
            
        scope.content = this.content;
        scope.title = this.title;
        scope.width = this.width;
        scope.height = this.height;
        scope.close = function(){
            close.call(self);
        };
        scope.onMaskClick = function(e){
            if($(e.target).closest(self._contentEl).length > 0) return;
            close.call(self);
        }
          
        popupTpl(scope, function(el, scope) {
            self._el = el;
            self._modalSel = '.modal._c'+scope.$id;
            self._contentSel = '.dd-b-popup-content._c'+scope.$id;
             
            el.addClass('mod_' + self.mod);
              
            self._animator = $animator(scope, {
                ngAnimate: el.attr('ng-animate')
            });
            if(self.loader) setLoader.call(self, self.loader);
            scope.$watch('content', function(content){
                $timeout(function(){
                    var contentEl = self._el.find(self._contentSel);
                      
                    self._contentEl = contentEl;
                        
                    if(content.template){
                        $compile($(content.template))(scope, function(el){
                            contentEl.empty().append(el);
                        });
                    } else if(content.el){
                        contentEl.empty().append(content.el);
                    }
                    scope.width = toSize(content.width || scope.width);
                    scope.height = toSize(content.height || scope.height);
                }, 0);
            });
              
        });
            
        this._windowListeners = {
            'keydown': function(e){
                if(e.keyCode == 27 && self == popups[popups.length - 1]) {
                    scope.$apply(function(){
                        close.call(self);
                    });
                    return false;
                }
            }            
        };
                      
        scope.$digest();
    }       
    function open(){
        if(popups.indexOf(this) > 0 ) return this;
            
        var self = this,
            htmlEl = angular.element('html'),
            width = htmlEl.width();
                
        htmlEl
            .addClass('noscroll')
            .css({
                marginRight: htmlEl.width()-width
            });           
          
        this._animator.enter(this._el, bodyEl);
            
        angular.element($window).on(this._windowListeners);
        popups.push(this);
        return this;
    }
    function close(){
        this._animator.leave(this._el, bodyEl);
        angular.element($window).off(this._windowListeners);
        var index = popups.indexOf(this);
        popups.splice(index, 1);
          
        if(popups.length == 0) {
            $timeout(function(){
                var htmlEl = angular.element('html');
                htmlEl
                    .removeClass('noscroll')
                    .css({
                        marginRight: 0
                    });                    
            }, 200 /*Animation time*/);
        }
           
        return this;
    }
    function setSize(size){
        var scope = this.scope;
        scope.width = toSize(size.width);
        scope.height = toSize(size.height);
        if(scope.$$phase != '$apply') scope.$digest();
        return this;
    }
    function setLoader(loader){
        var self = this,
            scope = this.scope,
            deferedLoader = $q.defer(),
            animateContent = false,                
            loadingDone = function(){
                loadingDone = true;
            };
        this._el.removeClass('state_active');
        $timeout(function(){
            if(loadingDone === true) return;
            loadingDone = ddLoading(self._el, self.scope, {
                mod: 'transparent'
            });
        }, 500);
                
        deferedLoader.promise.then(function(content){
            scope.content = content;
            loadingDone();
            self._el.addClass('state_active');
        }, function(){
            loadingDone();
            self._el.addClass('state_active');
            if(!scope.content) scope.content = {template: notLoadedTpl};
        });
        loader(function(content){
            scope.$apply(function(){
                deferedLoader.resolve(content);
            });
        }); 
        return this;   
    }
    function toSize(value){
        return typeof value == 'string' ? value : parseInt(value) + 'px';
    }
}]);
