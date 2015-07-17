/**
 * @requires dd.directive:ddMainMenu:ddMainMenu.css
 *
 * @ngdoc directive
 * @name dd.directive:ddMainMenu
 * @function
 *
 * @description
 * Главное меню
 *
 * @element ANY
 *
 * @param {expression} ddMainMenu Параметры меню:
 *
 *   * `{Integer}` `width` — Ширина
 *
 * @example
<example module="ddDocs">
  <file name="script.js">
    function menuCtrl($scope){
        $scope.menuConfig = {
            width: 280,
            scope: $scope
        }
    }
  </file>
  <file name="index.html">
    <div ng-controller="menuCtrl">
        <div ng-click="mainmenu.show()" class="btn btn-default">Show menu</div>
        <div dd-main-menu="menuConfig">
	        <div><i class="dd-icon dd-icon-user"></i> Главная</div>
	        <div><i class="dd-icon dd-icon-user"></i> Желания</div>
	        <div><i class="dd-icon dd-icon-user"></i> Благодарности</div>
        </div>
    </div>
  </file>
  <file name="styles.css">
    .dd-b-mainmenu-content {
        min-height: 1000px;
        }
  </file>  
</example>

 */
defineDirective('ddMainMenu', ['$timeout', function($timeout){
    
    var $ = angular.element;

    return {
        scope: {
            cfg: '=ddMainMenu'            
        },
        replace: true,
        transclude: true,
        template:
            '<div class="dd-b-mainmenu" msd-wheel="onMouseWheel($event, $delta, $deltaX, $deltaY)" ng-click="onBodyClick($event)" ng-animate="{show: \'dd-b-mainmenu-a-show\', hide: \'dd-b-mainmenu-a-hide\'}" ng-show="isShow">' +
                '<div class="dd-b-mainmenu-h" style="width:{{width}}px;">' +
                    '<div class="dd-b-mainmenu-hh" ng-mouseleave="hide()">' +
                        '<div class="dd-b-mainmenu-header"></div>' +
                        '<div ng-transclude class="dd-b-mainmenu-content"></div>' +
                        '<div class="dd-b-mainmenu-footer"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
        compile: function(tElement){
            return function(scope, iElement){
            
                var cfg = scope.cfg;
                
                if(cfg.scope) cfg.scope.mainmenu = {
                    show: function(){
                        _show.call(scope);
                    }
                };
                
                scope.isShow = false;
                scope.width = cfg.width || 300;
                scope.show = _show;
                scope.hide = _hide;
                
                scope._menuEl = iElement.find('.dd-b-mainmenu-hh');
                
                scope.onMouseWheel = function(e, delta, deltaX, deltaY){
                    var menuEl = $(e.target).closest(scope._menuEl);
                    if(menuEl.size() > 0){
                        menuEl.scrollTop(menuEl.scrollTop() - deltaY * 50);
                    }
                    e.preventDefault();
                }
                scope.onBodyClick = function(e){
                    if($(e.target).closest(scope._menuEl).size() > 0) return;
                    _hide.call(scope);
                }
                
                scope.windowListeners = {
                    'keydown': function(e){
                        if(e.keyCode == 27) {
                            scope.$apply(function(){
                                _hide.call(scope);
                            });
                        }
                    }            
                };                
            }
        }
    };
    
    function _show(){
        var self = this;
        $timeout(function(){
            self._menuEl.scrollTop(0);
        }, 0);       
        $(window).on(this.windowListeners);
        this.isShow = true;                   
    }
    function _hide(){
        $(window).off(this.windowListeners);
        this.isShow = false;                   
    }    
}]);
