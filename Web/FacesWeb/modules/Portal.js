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
        $urlRouterProvider.otherwise("/home/overview");

        $stateProvider
            .state('home', {
                url: "/home",
                views: {
                    'main-view': {
                        templateUrl: "directives/elements/templates/MainView.html",
                        controller: 'MainViewController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('home.overview', {
                url: "/overview",
                views: {
                    'overview': {
                        templateUrl: "directives/elements/templates/Overview.html",
                        controller: 'OverviewController',
                        controllerAs: 'vm'
                    }
                }
            })      
    }]);

    app.run(function ($http, CacheFactory) {
        $http.defaults.cache = CacheFactory('defaultCache', {});
    });

    app.run(function ($rootScope, $state, AuthenticationService, AUTH_EVENTS) {

        //before each state change, check if the user is logged in
        //and authorized to move onto the next state
        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (!AuthenticationService.userAuthenticated()) {
                // user is not authenticated
                if (next.name == 'home') {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return;
                }
                event.preventDefault();
                $state.go('home', {}, { reload: false });
            }
            else
                $rootScope.loadingView = true;
        });

        $rootScope.$on('$stateChangeSuccess', function (e, curr, prev) {
            // Hide loading message
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