/**
 * @requires jquery/jquery.js
 * @requires angular/angular.js
 * @requires hamster/hamster.js 
 * @requires mousewheel/mousewheel.js 
 * @requires bootstrap/css/bootstrap.css
 * @requires dd:dd.css
 *
 * @ngdoc overview
 * @name dd
 * @description
 *
 * The `dd` is an DaruDar module which contains all of the core DaruDar services.
 */

var appModule = angular.module('dd',['ngLocale','monospaced.mousewheel'])
        /*
        .config(['$provide',function($provide){
            $provide.factory('$ddData', function(){
                return {
                    get: function(value){
                        return DD_Data[value] || value;
                    }
                }
            });
        }])
        */
        // Инициализируем локализацию приложения в службе $locale  
        .run(['$locale', function($locale){
            $locale.DD = {}; // DD_LOCALE;
        }]);

//var DD_DATA = window.DD_DATA || {};

/**
 * @ngdoc function
 * @name dd.defineDirective
 * @function
 *
 * @description
 * Создает директиву в базовом модуле. Все директивы должны быть созданны через вызов `defineDirective`.
 *
 * @param {string} name Name of the directive in camel-case. (ie ngBind which will match as ng-bind).
 * @param {function} defineDirective An injectable directive factory function. See {@link http://docs.angularjs.org/guide/directive guide/directive} for more info.
 */
function defineDirective(name, directiveFactory){
    appModule.directive(name, directiveFactory);
}
/**
 * @ngdoc function
 * @name dd.defineFactory
 * @function
 *
 * @description
 * Создает фабрику службы в базовом модуле. Все фабрики служб должны быть созданны через вызов `defineFactory`.
 *
 * @param {string} name The name of the instance.
 * @param {function} $getFn {function()} – The $getFn for the instance creation. Internally this is a short hand for $provide.provider(name, {$get: $getFn}).
 */
function defineFactory(name, $getFn){
    appModule.factory(name, $getFn);
}
