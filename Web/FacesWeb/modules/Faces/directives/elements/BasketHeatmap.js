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
            scope: true,
            bindToController: {
                basketHeatmap: '='
            }
        };
    }

    function BasketHeatmapController() {

        var vm = this;

        var max = 100;
        var dataPoints = [];
        var dataKeys = ['reparto_uomo', 'reparto_donna', 'cosmetici' ];
        //for (var i = 0; i < dataKeys.length; i++) {
        //    dataPoints.push({ id: dataKeys[i], value: i * 10 });
        //}
        dataPoints.push({ id: dataKeys[0], value: 15 });
        dataPoints.push({ id: dataKeys[1], value: 60 });
        dataPoints.push({ id: dataKeys[2], value: 95 });

        vm.heatmapConfig = {
            svgUrl: 'modules/Faces/images/stores/GiglioBagnara/StoreSestriPonente.svg',
            plugin: 'SvgAreaHeatmap',
            gradient: {
                // enter n keys between 0 and 1 here
                // for gradient color customization                
                '0.33': "rgb(0,255,0)",
                '0.66': "rgb(255,140,0)",
                '1': "red",
            },
        }

        vm.heatmapData = {
            max: max,
            min: 0,
            data: dataPoints
        }

    }

    BasketHeatmapController.$inject = [];

})();