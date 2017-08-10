(function () {
    'use strict';

    angular.module('faces')
        .component('graphs', {
            templateUrl: 'modules/Faces/components/templates/Graphs.html',
            controller: GraphsController
        });

    function GraphsController($rootScope, $http, $filter, $q, StoreTreeService, OdataService, ChartService, UtilityService, moment) {

        var $ctrl = this;
        var _subscription = null;

        var months = [
            'Gen',
            'Feb',
            'Mar',
            'Apr',
            'Mag',
            'Giu',
            'Lug',
            'Ago',
            'Set',
            'Ott',
            'Nov',
            'Dic'
        ]

        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        function init() {
            $ctrl.cameraList = [];
            $ctrl.options = {
                title: {
                    display: true,
                    text: ''
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                responsive: true,
                maintainAspectRatio: true
            }
            $ctrl.labels = [];
            $ctrl.data = [];
            $ctrl.characteristics = [
                { id: 'Gender', name: 'Sesso', labels: ['Donne', 'Uomini'], possibleValues: ['F', 'M'], canGroup: true },
                { id: 'Age', name: 'Età', labels: ['0-12', '13-19', '20-60', '60+'], possibleValues: [{ values: [0, 12], operators: '<,<=' }, { values: [12, 19], operators: '<,<=' }, { values: [19, 60], operators: '<,<=' }, { values: [60], operators: '>' }], canGroup: false },
                { id: 'Eyeglasses', name: 'Occhiali', labels: ['Con occhiali', 'Senza occhiali'], possibleValues: [true, false], canGroup: true },
                { id: 'Mustaches', name: 'Baffi', labels: ['Con baffi', 'Senza baffi'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false },
                { id: 'Beard', name: 'Barba', labels: ['Con barba', 'Senza barba'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false }
            ]
            $ctrl.selectedCharacteristic = $ctrl.characteristics[0];

            $ctrl.endDate = new Date();
            $ctrl.startDate = new Date();
            $ctrl.startDate.setDate(1);


            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function reload() {

            $rootScope.loadingContent = true;

            $ctrl.labels.length = 0;
            $ctrl.data.length = 0;

            $ctrl.labels = ChartService.getMonthLabels($ctrl.startDate, $ctrl.endDate);
            var dateFilters = ChartService.getMonthFilters($ctrl.startDate, $ctrl.endDate);
            var numberOfMonths = ChartService.getNumberOfMonths($ctrl.startDate, $ctrl.endDate);

            $ctrl.series = $ctrl.selectedCharacteristic.labels;

            $ctrl.series.map(function () {
                $ctrl.data.push(new Array(numberOfMonths));
            })

            var context = StoreTreeService.getContext();

            if (!context.store) {
                //setChartsEmpty($ctrl.charts);
                return;
            }

            if ($ctrl.selectedCharacteristic.canGroup) {
                dateFilters.map(d => {
                    var xIndex = d.index;
                    OdataService.getFaces(new Date(d.year, d.month, 1),
                        context.cameras,
                        new Date(d.year, d.month, d.days),
                        true,
                        null,
                        [$ctrl.selectedCharacteristic.id],
                        { property: 'ID', transformation: 'countdistinct', alias: 'total' }
                    ).then(function (response) {
                        $rootScope.loadingContent = false;
                        if (response.status == 200 && response.data.value.length) {
                            //for (var i = 0; i < $ctrl.selectedCharacteristic.labels.length; i++) {
                            //    var total = $filter('filter')(response.data.value, function (val) {
                            //        if (val[$ctrl.selectedCharacteristic.id] == $ctrl.selectedCharacteristic.possibleValues[i]) {
                            //            return true;
                            //        }
                            //        else {
                            //            return false;
                            //        }
                            //    })[0].total;
                            //    $ctrl.data[i][xIndex] = total;
                            //}
                            var counts = ChartService.getCharacteristicGroupsCount($ctrl.selectedCharacteristic, response.data.value);
                            for (var i = 0; i < counts.length; i++) {
                                $ctrl.data[i][xIndex] = counts[i];
                            }
                        }
                        else {
                            //setChartsEmpty($ctrl.charts);
                        }
                    }, function (error) { $rootScope.loadingContent = false; })
                });
            }
            else {
                dateFilters.map(d => {
                    var xIndex = d.index;
                    OdataService.getFaces(new Date(d.year, d.month, 1),
                        context.cameras,
                        new Date(d.year, d.month, d.days),
                        true,
                        null, null, null,
                        [$ctrl.selectedCharacteristic.id]
                    ).then(function (response) {
                        $rootScope.loadingContent = false;
                        if (response.status == 200 && response.data.value.length) {
                            //for (var i = 0; i < $ctrl.selectedCharacteristic.labels.length; i++) {
                            //    var filteredValues = $filter('filter')(response.data.value, function (val) {
                            //        var values = $ctrl.selectedCharacteristic.possibleValues[i].values;
                            //        var op = $ctrl.selectedCharacteristic.possibleValues[i].operators;

                            //        if (values.length == 1) {
                            //            if (UtilityService.operators[op](val[$ctrl.selectedCharacteristic.id], values[0])) {
                            //                return true;
                            //            }
                            //            else {
                            //                return false;
                            //            }
                            //        }
                            //        else {
                            //            if (UtilityService.operators[op](val[$ctrl.selectedCharacteristic.id], values[0], values[1])) {
                            //                return true;
                            //            }
                            //            else {
                            //                return false;
                            //            }
                            //        }
                            //    });
                            //    $ctrl.data[i][xIndex] = filteredValues.length;
                            //}
                            
                            var counts = ChartService.getCharacteristicCount($ctrl.selectedCharacteristic, response.data.value);
                            for (var i = 0; i < counts.length; i++) {
                                $ctrl.data[i][xIndex] = counts[i];
                            }
                        }
                        else {
                            //setChartsEmpty($ctrl.charts);
                        }
                    }, function (error) { $rootScope.loadingContent = false; })
                });
            }
        }

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
        $ctrl.reload = reload;
    }
})();