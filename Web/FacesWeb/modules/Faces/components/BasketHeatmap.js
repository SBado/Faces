(function () {
    'use strict';

    angular.module('faces')
        .component('basketHeatmap', {
            templateUrl: 'modules/Faces/components/templates/BasketHeatmap.html',
            controller: BasketHeatmapController,
            bindings: {
                heatmapId: '<',
                points: '<',
                config: '<',
                maxValue: '<'
            }
        });    

    function BasketHeatmapController($scope, StoreTreeService, WebApiService) {
        var ctrl = this;
        var _watch = null;          

        function reload() {
            //ctrl.heatData.data = ctrl.dataPoints;
        }

        function getPointLabel(point) {
            return point.id.split('_')
                .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
                .join(' ');
        }

        function clean() {
            _watch();
        }

        ctrl.getPointLabel = getPointLabel;

        ctrl.$onInit = function () {

            
            //ctrl.heatData = {
            //    min: 0,
            //    max: ctrl.maxValue,
            //    data: ctrl.dataPoints
            //}

            //_watch = $scope.$watch(function () {
            //    return ctrl.dataPoints;
            //}, reload, true);
            //$scope.$on("$destroy", clean);
        };

        ctrl.$onChanges = function (changesObj) {
            ctrl.config = changesObj.config.currentValue;
            ctrl.heatData = {
                min: 0,
                max: changesObj.maxValue.currentValue,
                data: changesObj.points.currentValue
            }
        }
    }    

})();