(function () {
    'use strict';

    angular.module('faces')
        .component('basketsOverview', {
            templateUrl: 'modules/Faces/components/templates/BasketsOverview.html',
            controller: BasketsOverviewController
        });            

    function BasketsOverviewController($scope, StoreTreeService, WebApiService) {
        var $ctrl = this;
        var _subscription = null;
        var max = 100;
        var dataPoints = [];
        var dataKeys = ['reparto_uomo', 'reparto_donna', 'cosmetici'];
        var _imagesBasePath = 'modules/Faces/images/stores';        

        function init() {
            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function reload() {
            //if (!StoreTreeService.context.store) {
            //    return;
            //}

            var context = StoreTreeService.getContext();

            dataPoints.push({ id: dataKeys[0], value: 15 });
            dataPoints.push({ id: dataKeys[1], value: 60 });
            dataPoints.push({ id: dataKeys[2], value: 95 });

            $ctrl.heatmaps = [];

            if (context.building) {
                var company = context.company.Name.toLowerCase().replace(/ /g, '_');
                var building = context.building.Name.toLowerCase().replace(/ /g, '_');
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

                var points = [];
                points.push({ id: dataKeys[0], value: 15 });
                points.push({ id: dataKeys[1], value: 60 });
                points.push({ id: dataKeys[2], value: 95 });

                $ctrl.heatmaps.length = 0;
                $ctrl.heatmaps.push({
                    points: angular.copy(points),
                    config: heatmapConfig,
                    maxValue: max
                })
            }

            else if (context.company) {
                var svgPaths = [];
                context.tree.buildings.map(building => {
                    var company = context.company.Name.toLowerCase().replace(/ /g, '_');
                    var svgPath = [_imagesBasePath, company, building.Name.toLowerCase().replace(/ /g, '_'), 'store.svg'].join('/');
                    svgPaths.push(svgPath);
                });

                $ctrl.heatmaps.length = 0;
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

                    $ctrl.heatmaps.push({
                        points: angular.copy(points),
                        config: heatmapConfig,
                        maxValue: max
                    })
                });
            }

            WebApiService.getBasketsInStore(context.zones).then(function (response) {
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

        //    $ctrl.heatmaps = [];

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

        //        $ctrl.heatmaps.length = 0;
        //        $ctrl.heatmaps.push({
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

        //        $ctrl.heatmaps.length = 0;
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

        //            $ctrl.heatmaps.push({
        //                data: heatmapData,
        //                config: heatmapConfig
        //            })
        //        });
        //    }

        //    WebApiService.getBasketsInStore().then(function (response) {
        //        if (response.status == 200 && response.data.value.length) {
        //        }
        //    });
        //}

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
    }   
})();