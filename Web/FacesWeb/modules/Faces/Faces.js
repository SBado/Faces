(function () {
    var app = angular.module('faces', ['portal', 'rx', 'angular.filter', 'angularBootstrapNavTree', 'chart.js', 'heatmap']);   

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/home/overview");

        $stateProvider
            .state('home.overview', {
                url: "/overview",
                data: {
                    pageTitle: 'Overview'
                },
                views: {
                    'pages': {
                        template: "<store-overview>"
                    }
                }
            })
            .state('home.baskets', {
                url: "/baskets",
                data: {
                    pageTitle: 'Baskets Overview'
                },
                views: {
                    'pages': {
                        template: '<baskets-overview>'
                    }
                }
            })
    }])
        .run(function () {
            String.prototype.formatStoreName = function () {
                return this.toLowerCase().replace(/ /g, '_');
            };
        });    
})();