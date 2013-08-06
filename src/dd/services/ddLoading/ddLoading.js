/**
 * @requires dd.$ddLoading:ddLoading.css
 *
 * @ngdoc function
 * @name dd.$ddLoading
 * @function
 *
 * @description
 * Служба $ddLoading устанавливает для элемента состояние загрузки.
 *
 * @param {jQuery element} el Элемент, которому устанавливается состояние загрузки
 * @param {object} scope Контекст к которому будет подвязана анимация загрузки
 * @param {object=} options Конфигурация загрузчика: 
 *
 *   * `{string=}` `mod` — Модификация
 *
 * @return {function} Функция завершения загрузки
 */
defineFactory('$ddLoading', ['$animator', function($animator){
    var loadingTpl = '<div class="dd-b-loading" ng-animate="{enter:\'dd-a-fade-enter\', leave:\'dd-a-fade-leave\'}"></div>',
        defaultCfg = {};
    
    return ddLoading;
    
    function ddLoading(el, scope, cfg){
        var loadingEl = $(loadingTpl),
            animator = $animator(scope, {
                ngAnimate: loadingEl.attr('ng-animate')
             });
            
        cfg = cfg || defaultCfg;
          
        if(cfg.mod) loadingEl.addClass('mod_' + cfg.mod);
            
        animator.enter(loadingEl, el);           
            
        function done(){
            animator.leave(loadingEl, el);
        }
            
        return done;
    }    
}]);
