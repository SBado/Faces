(function () {
    var app = angular.module('faces', ['portal', 'angularBootstrapNavTree', 'chart.js', 'heatmap']);   

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
            .state('home.baskets', {
                url: "/baskets",
                data: {
                    title: 'Baskets Heatmap'
                },
                views: {
                    'pages': {
                        templateUrl: "modules/Faces/directives/elements/templates/BasketHeatmap.html",
                        controller: 'BasketHeatmapController',
                        controllerAs: 'vm'
                    }
                }
            })
    }]);    
})();