(function () {
    'use strict';

    angular.module('faces')
        .directive('basketsOverview', basketsOverviewDirective)
        .controller('BasketsOverviewController', BasketsOverviewController)

    function basketsOverviewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/BasketsOverview.html',
            controller: BasketsOverviewController,
            controllerAs: 'vm',
            scope: {}
        };
    }

    function BasketsOverviewController($scope, StoreTreeService, OdataService) {
        var vm = this;
        var max = 100;
        var dataPoints = [];
        var dataKeys = ['reparto_uomo', 'reparto_donna', 'cosmetici'];
        var _imagesBasePath = 'modules/Faces/images/stores';
        var _treeLoadedEvent = null;
        var _watches = [];

        function init() {
            _watches.push($scope.$watch(function () {
                return StoreTreeService.context.store;
            }, reload, true));
            $scope.$on("$destroy", clean);

            if (StoreTreeService.context.store) {
                reload();
            }

        }

        function reload() {
            if (!StoreTreeService.context.store) {
                return;
            }

            dataPoints.push({ id: dataKeys[0], value: 15 });
            dataPoints.push({ id: dataKeys[1], value: 60 });
            dataPoints.push({ id: dataKeys[2], value: 95 });

            vm.heatmaps = [];

            if (StoreTreeService.context.building) {
                var company = StoreTreeService.context.company.Name.toLowerCase().replace(/ /g, '_');
                var building = StoreTreeService.context.building.Name.toLowerCase().replace(/ /g, '_');
                var svgPath = [_imagesBasePath, company, building, 'store.svg'].join('/');               

                var heatmapConfig = {
                    svgUrl: svgPath,
                    plugin: 'SvgAreaHeatmap',
                    gradient: {
                        '0.33': "rgb(0,255,0)",
                        '0.66': "rgb(255,140,0)",
                        '1': "red",
                    },
                }

                vm.heatmaps.length = 0;
                vm.heatmaps.push({
                    points: angular.copy(points),
                    config: heatmapConfig,
                    maxValue: max
                })
            }

            else if (StoreTreeService.context.company) {
                var svgPaths = [];
                StoreTreeService.context.tree.buildings.map(building => {
                    var company = StoreTreeService.context.company.Name.toLowerCase().replace(/ /g, '_');
                    var svgPath = [_imagesBasePath, company, building.Name.toLowerCase().replace(/ /g, '_'), 'store.svg'].join('/');
                    svgPaths.push(svgPath);
                });

                vm.heatmaps.length = 0;
                svgPaths.map(svgPath => {                    
                    var heatmapConfig = {
                        svgUrl: svgPath,
                        plugin: 'SvgAreaHeatmap',
                        gradient: {
                            '0.33': "rgb(0,255,0)",
                            '0.66': "rgb(255,140,0)",
                            '1': "red",
                        },
                    }

                    var points = [];
                    points.push({ id: dataKeys[0], value: 15 });
                    points.push({ id: dataKeys[1], value: 60 });
                    points.push({ id: dataKeys[2], value: 95 });

                    vm.heatmaps.push({
                        points: angular.copy(points),
                        config: heatmapConfig,
                        maxValue: max
                    })
                });
            }

            OdataService.getBasketsInStore().then(function (response) {
                if (response.status == 200 && response.data.value.length) {
                }
            });
        }

        //function reload() {
        //    if (!StoreTreeService.context.store) {
        //        return;
        //    }

        //    dataPoints.push({ id: dataKeys[0], value: 15 });
        //    dataPoints.push({ id: dataKeys[1], value: 60 });
        //    dataPoints.push({ id: dataKeys[2], value: 95 });

        //    vm.heatmaps = [];

        //    if (StoreTreeService.context.building) {
        //        var company = StoreTreeService.context.company.Name.toLowerCase().replace(/ /g, '_');
        //        var building = StoreTreeService.context.building.Name.toLowerCase().replace(/ /g, '_');
        //        var svgPath = [_imagesBasePath, company, building, 'store.svg'].join('/');

        //        var heatmapData = {
        //            max: max,
        //            min: 0,
        //            data: dataPoints
        //        }

        //        var heatmapConfig = {
        //            svgUrl: svgPath,
        //            plugin: 'SvgAreaHeatmap',
        //            gradient: {
        //                '0.33': "rgb(0,255,0)",
        //                '0.66': "rgb(255,140,0)",
        //                '1': "red",
        //            },
        //        }

        //        vm.heatmaps.length = 0;
        //        vm.heatmaps.push({
        //            data: heatmapData,
        //            config: heatmapConfig
        //        })
        //    }

        //    else if (StoreTreeService.context.company) {
        //        var svgPaths = [];
        //        StoreTreeService.context.tree.buildings.map(building => {
        //            var company = StoreTreeService.context.company.Name.toLowerCase().replace(/ /g, '_');
        //            var svgPath = [_imagesBasePath, company, building.Name.toLowerCase().replace(/ /g, '_'), 'store.svg'].join('/');
        //            svgPaths.push(svgPath);
        //        });

        //        vm.heatmaps.length = 0;
        //        svgPaths.map(svgPath => {
        //            var heatmapData = {
        //                max: 0,
        //                min: 0,
        //                data: dataPoints
        //            }

        //            var heatmapConfig = {
        //                svgUrl: svgPath,
        //                plugin: 'SvgAreaHeatmap',
        //                gradient: {
        //                    '0.33': "rgb(0,255,0)",
        //                    '0.66': "rgb(255,140,0)",
        //                    '1': "red",
        //                },
        //            }

        //            vm.heatmaps.push({
        //                data: heatmapData,
        //                config: heatmapConfig
        //            })
        //        });
        //    }

        //    OdataService.getBasketsInStore().then(function (response) {
        //        if (response.status == 200 && response.data.value.length) {
        //        }
        //    });
        //}

        function clean() {
            for (var i = 0; i < _watches.length; i++) {
                _watches[i]();
            }
        }

        init();       
    }

    BasketsOverviewController.$inject = ['$scope', 'StoreTreeService', 'OdataService'];

})();