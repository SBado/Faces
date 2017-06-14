(function () {
    var app = angular.module('portal', ['ngRoute', 'ngResource', 'ngAnimate', 'ngMaterial', 'ui.router', 'ui.bootstrap', 'ui.bootstrap.contextMenu', 'ui.validate', 'angular-confirm', 'angular-cache', 'LocalStorageModule', 'angularBootstrapNavTree']);

    //https://github.com/alarv/ng-login
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated'
    })

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('HttpInterceptor', 'AuthInterceptor');
        //$httpProvider.interceptors.push('AuthInterceptor');
    });

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/home");

        $stateProvider
            .state('home', {
                url: "/home",
                views: {
                    'main-view': {
                        templateUrl: "modules/Portal/directives/elements/templates/MainView.html",
                        controller: 'MainViewController',
                        controllerAs: 'vm'
                    }
                }
            })            
    }]);

    app.run(function ($http, CacheFactory) {
        $http.defaults.cache = CacheFactory('defaultCache', {});
    });

    app.run(function ($rootScope, $state, $transitions, AuthenticationService, AUTH_EVENTS) {

        //before each state change, check if the user is logged in
        //and authorized to move onto the next state
        $transitions.onStart({}, function (trans) {            
            if(!AuthenticationService.userAuthenticated()) {
                // user is not authenticated
                if (trans.to().name == 'home') {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return;
                }
                //event.preventDefault();
                $state.go('home', {}, { reload: false });
            }
            else
            $rootScope.loadingView = true;
        });

        $transitions.onSuccess({}, function (trans) {
            $rootScope.pageTitle = $state.current.data ? $state.current.data.pageTitle : 'Faces';
            $rootScope.loadingView = false;            
        });

        ///* To show current active state on menu */
        //$rootScope.getClass = function (path) {
        //    if ($state.current.name == path) {
        //        return "active";
        //    } else {
        //        return "";
        //    }
        //}       
    });
})();