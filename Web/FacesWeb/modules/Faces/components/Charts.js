(function () {
    'use strict';

    angular.module('faces')
        .component('charts', {
            templateUrl: 'modules/Faces/components/templates/Charts.html',
            controller: ChartsController
        });

    function ChartsController($q, $scope, $filter, StoreTreeService, OdataService, ChartService, UtilityService) {

        var $ctrl = this;
        var _subscription = null;

        function canLoad() {
            return ($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 's' && $ctrl.selectedCharacteristic) ||
                ($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 'm' && $filter('filter')($ctrl.characteristics, { selected: true }).length);
        }

        function init() {
            $ctrl.chartTypes = [
                { id: 'bar', label: 'Barre', type: 'many' },
                { id: 'horizontalBar', label: 'Barre Orizzontali', type: 'many' },
                { id: 'line', label: 'Linee', type: 'many' },
                { id: 'radar', label: 'Radar', type: 'many' },
                { id: 'pie', label: 'Torta', type: 'single' },
                { id: 'doughnut', label: 'Ciambella', type: 'single' },
                { id: 'polarArea', label: 'Area Polare', type: 'single' }
            ]

            $ctrl.queryTypes = [
                { id: 's', label: 'Caratteristica singola' },
                { id: 'm', label: 'Caratteristiche multiple' },
            ]

            $ctrl.temporalDetails = [                                
                { id: ChartService.temporalDetail.month, label: 'Mese' },
                { id: ChartService.temporalDetail.week, label: 'Settimana' },
                { id: ChartService.temporalDetail.day, label: 'Giorno' }
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
            $ctrl.selectedTemporalDetail = $ctrl.temporalDetails[0];

            _subscription = StoreTreeService.subscribe(reload);

            //if (StoreTreeService.getContext()) {
            //    reload();
            //}
        }

        function selectSingleCharacteristic() {

        }

        function changeChartType() {

            var index = $ctrl.queryTypes.findIndex(function (element) {
                return element.id == 'm';
            });

            if ($ctrl.selectedChartType.type == 'many' && index == -1) {
                $ctrl.queryTypes.push({ id: 'm', label: 'Caratteristica multipla' });
            }
            else if ($ctrl.selectedChartType.type == 'single' && index != -1) {
                $ctrl.queryTypes.splice(index, 1);
            }

            if ($ctrl.selectedChartType.type == 'single') {
                $ctrl.options['tooltips'] = {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var allData = data.datasets[tooltipItem.datasetIndex].data;
                            var tooltipLabel = data.labels[tooltipItem.index];
                            var tooltipData = allData[tooltipItem.index];
                            var total = 0;
                            for (var i in allData) {
                                total += allData[i];
                            }
                            var tooltipPercentage = Math.round((tooltipData / total) * 100);
                            return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
                        }
                    }
                }

                if ($ctrl.selectedChartType.id == 'pie' || $ctrl.selectedChartType.id == 'doughnut') {
                    $ctrl.options['pieceLabel'] = {
                        mode: 'percentage',
                        precision: 2
                    }
                }

            }
            else {
                delete $ctrl.options['tooltips'];
                delete $ctrl.options['pieceLabel'];
            }

            $ctrl.reload();
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

            if ($ctrl.selectedChartType.type == 'single') {
                $ctrl.labels = angular.copy($ctrl.selectedCharacteristic.labels);
            }
            else {
                $ctrl.labels = ChartService.getLabels($ctrl.startDate, $ctrl.endDate, $ctrl.selectedTemporalDetail.id);
            }
            var dateFilters = ChartService.getFilters($ctrl.startDate, $ctrl.endDate, $ctrl.selectedTemporalDetail.id);
            var numberOfItems = ChartService.getNumberOfItems($ctrl.startDate, $ctrl.endDate, $ctrl.selectedTemporalDetail.id);
            var promiseList = [];

            switch ($ctrl.selectedQueryType.id) {
                case 's':
                    if ($ctrl.selectedChartType.type == 'single') {
                        if ($ctrl.selectedCharacteristic.canGroup) {
                            promiseList.push(OdataService.getFaces($ctrl.startDate,
                                context.cameras,
                                $ctrl.endDate,
                                false,
                                null,
                                [$ctrl.selectedCharacteristic.id],
                                { property: 'ID', transformation: 'countdistinct', alias: 'total' }
                            ).then(function (response) {
                                //$ctrl.loading = false;
                                if (response.status == 200 && response.data.value.length) {
                                    var counts = ChartService.getCharacteristicGroupsCount($ctrl.selectedCharacteristic, response.data.value);
                                    $ctrl.data = counts;
                                }
                                else {
                                    //setChartsEmpty($ctrl.charts);
                                }
                            }, function (error) { $ctrl.loading = false; }))
                        }
                        else {
                            promiseList.push(OdataService.getFaces($ctrl.startDate,
                                context.cameras,
                                $ctrl.endDate,
                                false,
                                null, null, null,
                                [$ctrl.selectedCharacteristic.id]
                            ).then(function (response) {
                                //$ctrl.loading = false;
                                if (response.status == 200 && response.data.value.length) {
                                    var counts = ChartService.getCharacteristicCount($ctrl.selectedCharacteristic, response.data.value);
                                    $ctrl.data = counts;
                                }
                                else {
                                    //setChartsEmpty($ctrl.charts);
                                }
                            }, function (error) { $ctrl.loading = false; }))
                        }
                    }
                    else {
                        $ctrl.series = angular.copy($ctrl.selectedCharacteristic.labels);
                        $ctrl.series.map(function () {
                            $ctrl.data.push(new Array(numberOfItems));
                        })

                        if ($ctrl.selectedCharacteristic.canGroup) {
                            dateFilters.map(d => {
                                var xIndex = d.index;
                                promiseList.push(OdataService.getFaces(d.firstDate,
                                    context.cameras,
                                    d.lastDate,
                                    false,
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
                                promiseList.push(OdataService.getFaces(d.firstDate,
                                    context.cameras,
                                    d.lastDate,
                                    false,
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
                        $ctrl.data.push(new Array(numberOfItems));
                    });
                    dateFilters.map(d => {
                        var xIndex = d.index;
                        promiseList.push(OdataService.getFaces(d.firstDate,
                            context.cameras,
                            d.lastDate,
                            false,
                            null, null, null,
                            selectList
                        ).then(function (response) {
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
        $ctrl.changeChartType = changeChartType;
        $ctrl.reload = reload;
    }
})();