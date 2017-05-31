//https://github.com/alarv/ng-login

(function () {
    'use strict';

    angular.module('faces')
        .directive('basketHeatmap', basketHeatmapDirective)
        .controller('BasketHeatmapController', BasketHeatmapController)

    function basketHeatmapDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/BasketHeatmap.html',
            controller: BasketHeatmapController,
            controllerAs: 'vm',
            scope: {}
        };
    }

    function BasketHeatmapController($scope, StoreTreeService, WebApiService) {
        var vm = this;
        var max = 100;
        var dataPoints = [];
        var dataKeys = ['reparto_uomo', 'reparto_donna', 'cosmetici'];
        var _apiListeners = null;
        var _watches = [];

        function init() {
            if (!StoreTreeService.storeTreeApi) {
                _apiListeners = $scope.$on('tree-loaded', function () {
                    _apiListeners();
                    StoreTreeService.storeTreeApi.hideZones();
                    $scope.$on("$destroy", StoreTreeService.storeTreeApi.showZones);
                });
            }
            else {
                StoreTreeService.storeTreeApi.hideZones();
                $scope.$on("$destroy", StoreTreeService.storeTreeApi.showZones);
            }

            _watches.push($scope.$watch(function () {
                return StoreTreeService.context.store;
            }, reload, true));
            $scope.$on("$destroy", clean);

            vm.heatmapConfig = {
                svgUrl: 'modules/Faces/images/stores/giglio_bagnara/store_sestri_ponente.svg',
                plugin: 'SvgAreaHeatmap',
                gradient: {
                    // enter n keys between 0 and 1 here
                    // for gradient color customization                
                    '0.33': "rgb(0,255,0)",
                    '0.66': "rgb(255,140,0)",
                    '1': "red",
                },
            }
        }

        function reload() {

            if (!StoreTreeService.context.store) {
                return;
            }            

            vm.heatmapConfig = {
                svgUrl: 'modules/Faces/images/stores/giglio_bagnara/store_brignole.svg',
                plugin: 'SvgAreaHeatmap',
                gradient: {
                    // enter n keys between 0 and 1 here
                    // for gradient color customization                
                    '0.33': "rgb(0,255,0)",
                    '0.66': "rgb(255,140,0)",
                    '1': "red",
                },
            }

            dataPoints.push({ id: dataKeys[0], value: 15 });
            dataPoints.push({ id: dataKeys[1], value: 60 });
            dataPoints.push({ id: dataKeys[2], value: 95 });

            vm.heatmapData = {
                max: max,
                min: 0,
                data: dataPoints
            }

            WebApiService.getBasketsInStore().then(function (response) {
                if (response.status == 200 && response.data.value.length) {
                }
            });
        }

        function clean() {
            for (var i = 0; i < _watches.length; i++) {
                _watches[i]();
            }
        }

        init();

    }

    BasketHeatmapController.$inject = ['$scope', 'StoreTreeService', 'WebApiService'];

})();