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
                        template: "<store-overview>",
                        controller: 'StoreOverviewController',
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
                        template: '<basket-heatmap>',
                        controller: 'BasketHeatmapController',
                        controllerAs: 'vm'
                    }
                }
            })
    }]);    
})();