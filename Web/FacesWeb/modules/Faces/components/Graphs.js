(function () {
    'use strict';

    angular.module('faces')
        .component('graphs', {
            templateUrl: 'modules/Faces/components/templates/Graphs.html',
            controller: GraphsController
        });

    function GraphsController($q, $scope, $filter, StoreTreeService, OdataService, ChartService, UtilityService) {

        var $ctrl = this;
        var _subscription = null;

        function canLoad() {
            return ($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 's' && $ctrl.selectedCharacteristic) ||
                ($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 'm' && $filter('filter')($ctrl.characteristics, { selected: true }).length);
        }

        function init() {
            $ctrl.chartTypes = [
                { id: 'bar', label: 'Barre' },
                { id: 'horizontalBar', label: 'Barre Orizzontali' },
                { id: 'line', label: 'Linee' },
                { id: 'radar', label: 'Radar' }
            ]

            $ctrl.queryTypes = [
                { id: 's', label: 'Caratteristica singola' },
                { id: 'm', label: 'Caratteristiche multiple' },
            ]


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
                maintainAspectRatio: false,                
            }
            $ctrl.labels = [];
            $ctrl.data = [];
            $ctrl.series = [];
            $ctrl.characteristics = [
                //{ id: 'Gender', name: 'Sesso', labels: ['Donne', 'Uomini'], possibleValues: ['F', 'M'], canGroup: true, selected: false },
                { id: 'Gender', name: 'Sesso', labels: ['Donne', 'Uomini'], possibleValues: [{ values: ['F'], operators: '==' }, { values: ['M'], operators: '==' }], canGroup: true, selected: false },
                { id: 'Age', name: 'Età', labels: ['0-12', '13-19', '20-60', '60+'], possibleValues: [{ values: [0, 12], operators: '<,<=' }, { values: [12, 19], operators: '<,<=' }, { values: [19, 60], operators: '<,<=' }, { values: [60], operators: '>' }], canGroup: false, selected: false },
                //{ id: 'Eyeglasses', name: 'Occhiali', labels: ['Con occhiali', 'Senza occhiali'], possibleValues: [true, false], canGroup: true, selected: false  },
                { id: 'Eyeglasses', name: 'Occhiali', labels: ['Con occhiali', 'Senza occhiali'], possibleValues: [{ values: [true], operators: '==' }, { values: [false], operators: '==' }], canGroup: true, selected: false },
                { id: 'Mustaches', name: 'Baffi', labels: ['Con baffi', 'Senza baffi'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false, selected: false },
                { id: 'Beard', name: 'Barba', labels: ['Con barba', 'Senza barba'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false, selected: false }
            ]
            //$ctrl.selectedCharacteristic = $ctrl.characteristics[0];

            $ctrl.endDate = new Date();
            $ctrl.startDate = new Date();
            $ctrl.startDate.setDate(1);


            _subscription = StoreTreeService.subscribe(reload);

            //if (StoreTreeService.getContext()) {
            //    reload();
            //}
        }

        function selectSingleCharacteristic() {

        }

        function reload() {

            var context = StoreTreeService.getContext();

            if (!context.store) {
                //setChartsEmpty($ctrl.charts);
                return;
            }

            if (!canLoad()) {
                return;
            }

            $ctrl.loading = true;

            $ctrl.data = [];
            $ctrl.labels = [];
            $ctrl.series = [];

            $ctrl.labels = ChartService.getMonthLabels($ctrl.startDate, $ctrl.endDate);
            var dateFilters = ChartService.getMonthFilters($ctrl.startDate, $ctrl.endDate);
            var numberOfMonths = ChartService.getNumberOfMonths($ctrl.startDate, $ctrl.endDate);
            var promiseList = [];

            switch ($ctrl.selectedQueryType.id) {
                case 's':
                    $ctrl.series = angular.copy($ctrl.selectedCharacteristic.labels);
                    $ctrl.series.map(function () {
                        $ctrl.data.push(new Array(numberOfMonths));
                    })

                    if ($ctrl.selectedCharacteristic.canGroup) {
                        dateFilters.map(d => {
                            var xIndex = d.index;
                            promiseList.push(OdataService.getFaces(new Date(d.year, d.month, 1),
                                context.cameras,
                                new Date(d.year, d.month, d.days),
                                true,
                                null,
                                [$ctrl.selectedCharacteristic.id],
                                { property: 'ID', transformation: 'countdistinct', alias: 'total' }
                            ).then(function (response) {
                                //$ctrl.loading = false;
                                if (response.status == 200 && response.data.value.length) {
                                    var counts = ChartService.getCharacteristicGroupsCount($ctrl.selectedCharacteristic, response.data.value);
                                    for (var i = 0; i < counts.length; i++) {
                                        $ctrl.data[i][xIndex] = counts[i];
                                    }                                    
                                }
                                else {
                                    //setChartsEmpty($ctrl.charts);
                                }
                            }, function (error) { $ctrl.loading = false; }))
                        });
                    }
                    else {
                        dateFilters.map(d => {
                            var xIndex = d.index;
                            promiseList.push(OdataService.getFaces(new Date(d.year, d.month, 1),
                                context.cameras,
                                new Date(d.year, d.month, d.days),
                                true,
                                null, null, null,
                                [$ctrl.selectedCharacteristic.id]
                            ).then(function (response) {
                                //$ctrl.loading = false;
                                if (response.status == 200 && response.data.value.length) {
                                    var counts = ChartService.getCharacteristicCount($ctrl.selectedCharacteristic, response.data.value);
                                    for (var i = 0; i < counts.length; i++) {
                                        $ctrl.data[i][xIndex] = counts[i];
                                    }
                                }
                                else {
                                    //setChartsEmpty($ctrl.charts);
                                }
                            }, function (error) { $ctrl.loading = false; }))
                        });
                    }
                    break;
                case 'm':
                    var selectedCharacteristicList = $filter('filter')($ctrl.characteristics, { selected: true });
                    var selectList = [];
                    selectedCharacteristicList.map(c => {
                        $ctrl.series.push.apply($ctrl.series, c.labels);
                        selectList.push(c.id);
                    })
                    $ctrl.series.map(function () {
                        $ctrl.data.push(new Array(numberOfMonths));
                    });
                    //$ctrl.loading = false;
                    dateFilters.map(d => {
                        var xIndex = d.index;
                        promiseList.push(OdataService.getFaces(new Date(d.year, d.month, 1),
                            context.cameras,
                            new Date(d.year, d.month, d.days),
                            true,
                            null, null, null,
                            selectList
                        ).then(function (response) {
                            //$ctrl.loading = false;
                            if (response.status == 200 && response.data.value.length) {
                                var counts = ChartService.getCharacteristicListCount(selectedCharacteristicList, response.data.value);
                                for (var i = 0; i < counts.length; i++) {
                                    $ctrl.data[i][xIndex] = counts[i];
                                }
                            }
                            else {
                                //setChartsEmpty($ctrl.charts);
                            }
                        }, function (error) { $rootScope.loadingContent = false; }))
                    });


                default:
                    break;
            }

            $q.all(promiseList).then(function () {
                $ctrl.loading = false;
            })


        }

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
        $ctrl.reload = reload;
    }
})();