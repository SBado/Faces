(function () {
    var app = angular.module('faces', ['portal', 'angularBootstrapNavTree', 'chart.js']);   

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/home/overview");

        $stateProvider           
            .state('home.overview', {
                url: "/overview",
                data: {
                    title: 'Overview'
                },
                views: {
                    'pages': {
                        templateUrl: "modules/Faces/directives/elements/templates/Overview.html",
                        controller: 'OverviewController',
                        controllerAs: 'vm'                        
                    }
                }
            })
    }]);    
})();