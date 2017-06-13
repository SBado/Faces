(function () {
    'use strict';

    angular.module('faces')
        .component('basketsOverview', {
            templateUrl: 'modules/Faces/components/templates/BasketsOverview.html',
            controller: BasketsOverviewController
        });

    function BasketsOverviewController($filter, StoreTreeService, WebApiService) {
        var $ctrl = this;
        var _subscription = null;        
        var _imagesBasePath = 'modules/Faces/images/stores';
       
        function init() {
            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function reload() {
            var context = StoreTreeService.getContext();

            WebApiService.getBasketsInStore(context.zones).then(function (response) {
                if (response.status == 200 && response.data.value.length) {
                    var totalBaskets = response.data.value.length;
                    var zones = $filter('groupBy')(response.data.value, 'CurrentZone');
                    var dataPoints = [];
                    angular.forEach(zones, function (baskets, zoneId) {
                        var zoneName = $filter('filter')(context.zones, { ID: zoneId })[0].Name.formatStoreName();                        
                        dataPoints.push({
                            id: zoneName,
                            value: baskets.length
                        });
                    });

                    $ctrl.heatmaps = [];

                    if (context.store.IsZone) {
                        var company = context.company.Name.formatStoreName();
                        var building = context.building.Name.formatStoreName();
                        var zone = context.store.Name.formatStoreName();
                        var svgPath = [_imagesBasePath, company, building, zone].join('/') + '.svg';

                        var heatmapConfig = {
                            svgUrl: svgPath,
                            plugin: 'SvgAreaHeatmap',
                            gradient: {
                                '0.33': "rgb(0,255,0)",
                                '0.66': "rgb(255,140,0)",
                                '1': "red",
                            },
                        }                     

                        $ctrl.heatmaps.length = 0;
                        $ctrl.heatmaps.push({
                            points: angular.copy(dataPoints),
                            config: heatmapConfig,
                            maxValue: totalBaskets
                        })
                    }

                    else if (context.building) {
                        var company = context.company.Name.formatStoreName();
                        var building = context.building.Name.formatStoreName();
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
                      
                        $ctrl.heatmaps.length = 0;
                        $ctrl.heatmaps.push({
                            points: angular.copy(dataPoints),
                            config: heatmapConfig,
                            maxValue: totalBaskets
                        })
                    }

                    else if (context.company) {
                        var svgPaths = [];
                        context.tree.buildings.map(building => {
                            var company = context.company.Name.formatStoreName();
                            var svgPath = [_imagesBasePath, company, building.Name.formatStoreName(), 'store.svg'].join('/');
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

                            $ctrl.heatmaps.push({
                                points: angular.copy(dataPoints),
                                config: heatmapConfig,
                                maxValue: totalBaskets
                            })
                        });
                    } 
                }
            });

            //dataPoints.push({ id: dataKeys[0], value: 15 });
            //dataPoints.push({ id: dataKeys[1], value: 60 });
            //dataPoints.push({ id: dataKeys[2], value: 95 });

           
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
        //        var company = StoreTreeService.context.company.Name.formatStoreName();
        //        var building = StoreTreeService.context.building.Name.formatStoreName();
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
        //            var company = StoreTreeService.context.company.Name.formatStoreName();
        //            var svgPath = [_imagesBasePath, company, building.Name.formatStoreName(), 'store.svg'].join('/');
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