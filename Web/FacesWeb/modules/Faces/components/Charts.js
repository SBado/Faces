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
            return $ctrl.firstDateTime <= $ctrl.lastDateTime && (($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 's' && $ctrl.selectedCharacteristic) ||
                ($ctrl.selectedQueryType && $ctrl.selectedQueryType.id == 'm' && $filter('filter')($ctrl.characteristics, { selected: true }).length));
        }

        function init() {
            $ctrl.chartTypes = [
                { id: 'bar', label: 'Barre', type: 'many' },
                { id: 'horizontalBar', label: 'Barre Orizzontali', type: 'many' },
                { id: 'line', label: 'Linee', type: 'many' },
                //{ id: 'radar', label: 'Radar', type: 'many' },
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
                { id: ChartService.temporalDetail.day, label: 'Giorno' },             
                { id: ChartService.temporalDetail.hour, label: 'Ora' },
                { id: ChartService.temporalDetail.dayOfWeek, label: 'Giorno della Settimana' },
                { id: ChartService.temporalDetail.hourOfDay, label: 'Ora del Giorno' },
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
                maintainAspectRatio: false        
            }
            $ctrl.labels = [];
            $ctrl.data = [];
            $ctrl.series = [];
            $ctrl.colors = ["rgba(255,0,0,1)", "rgba(0,0,255,1)",];
            $ctrl.characteristics = [                
                { id: 'Gender', name: 'Sesso', labels: ['Donne', 'Uomini'], colors: ["rgba(255,192,203,1)", "rgba(0,0,255,1)"], possibleValues: [{ values: ['F'], operators: '==' }, { values: ['M'], operators: '==' }], canGroup: true, selected: false },
                { id: 'Age', name: 'Età', labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70+'], colors: ["rgba(255,255,0,1)", "rgba(255,165,0,1)", "rgba(165,42,42,1)", "rgba(255,0,0,1)", "rgba(0,0,153,1)", "rgba(102,51,0,1)", "rgba(255,80,80,1)", "rgba(0,0,0,1)"], possibleValues: [{ values: [0, 10], operators: '<,<=' }, { values: [10, 20], operators: '<,<=' }, { values: [20, 30], operators: '<,<=' }, { values: [30, 40], operators: '<,<=' }, { values: [40, 50], operators: '<,<=' }, { values: [50, 60], operators: '<,<=' }, { values: [60, 70], operators: '<,<=' }, { values: [70], operators: '>' }], canGroup: false, selected: false },                
                { id: 'Eyeglasses', name: 'Occhiali', labels: ['Con occhiali', 'Senza occhiali'], possibleValues: [{ values: [true], operators: '==' }, { values: [false], operators: '==' }], canGroup: true, selected: false },
                { id: 'Mustaches', name: 'Baffi', labels: ['Con baffi', 'Senza baffi'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false, selected: false },
                { id: 'Beard', name: 'Barba', labels: ['Con barba', 'Senza barba'], possibleValues: [{ values: [0], operators: '==' }, { values: [0, 1], operators: '<,<=' }], canGroup: false, selected: false }
            ]            
            //$ctrl.selectedCharacteristic = $ctrl.characteristics[0];

            $ctrl.firstDateTime = new Date();
            $ctrl.firstDateTime.setDate(1);
            $ctrl.lastDateTime = new Date();
            $ctrl.lastDateTime.setDate(ChartService.daysInMonth[$ctrl.lastDateTime.getMonth()]);
            $ctrl.selectedChartType = $ctrl.chartTypes[0];
            changeChartType();
            $ctrl.selectedQueryType = $ctrl.queryTypes[0];
            $ctrl.selectedTemporalDetail = $ctrl.temporalDetails[2];
            $ctrl.selectedCharacteristic = $ctrl.characteristics[0];

            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {                
                reload();
            }
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

            //$ctrl.reload();
        }

        function reload() {            

            var context = StoreTreeService.getContext();

            if (!context.store) {
                return;
            }

            if (!canLoad()) {
                return;
            }

            $ctrl.loading = true;            

            $ctrl.data = [];
            $ctrl.labels = [];
            $ctrl.series = []; 
            //$ctrl.colors = $ctrl.selectedCharacteristic.colors || $ctrl.colors;

            if ($ctrl.selectedChartType.type == 'single') {
                $ctrl.labels = angular.copy($ctrl.selectedCharacteristic.labels);                
            }
            else {
                $ctrl.labels = ChartService.getLabels($ctrl.firstDateTime, $ctrl.lastDateTime, $ctrl.selectedTemporalDetail.id);
            }
            var dateFilters = ChartService.getFilters($ctrl.firstDateTime, $ctrl.lastDateTime, $ctrl.selectedTemporalDetail.id);
            var numberOfItems = ChartService.getNumberOfItems($ctrl.firstDateTime, $ctrl.lastDateTime, $ctrl.selectedTemporalDetail.id);
            var promiseList = [];

            switch ($ctrl.selectedQueryType.id) {
                case 's':
                    $ctrl.colors = $ctrl.selectedCharacteristic.colors
                    if ($ctrl.selectedChartType.type == 'single') {
                        if ($ctrl.selectedCharacteristic.canGroup) {
                            promiseList.push(OdataService.getFaces([{
                                firstDateTime: $ctrl.firstDateTime,
                                lastDateTime: $ctrl.lastDateTime
                            }],
                                context.cameras,
                                [true, true],
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
                            promiseList.push(OdataService.getFaces([{
                                firstDateTime: $ctrl.firstDateTime,
                                lastDateTime: $ctrl.lastDateTime
                            }],
                                context.cameras,
                                [true, true],
                                null, null, null, null,
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
                                promiseList.push(OdataService.getFaces(
                                    d.dateTimeRangeList,
                                    context.cameras,
                                    d.dateTimeEquality,                                    
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
                                promiseList.push(OdataService.getFaces(
                                    d.dateTimeRangeList,
                                    context.cameras,                                                                        
                                    d.dateTimeEquality,                                    
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
                        $ctrl.colors.concat(c.colors);
                        $ctrl.series.push.apply($ctrl.series, c.labels);
                        selectList.push(c.id);
                    })
                    $ctrl.series.map(function () {
                        $ctrl.data.push(new Array(numberOfItems));
                    });
                    dateFilters.map(d => {
                        var xIndex = d.index;
                        promiseList.push(OdataService.getFaces(
                            d.dateTimeRangeList,
                            context.cameras,
                            d.dateTimeEquality,                            
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

        function exportToExcel() {

            // Prepare Excel data:            
            var fileName = $ctrl.firstDateTime.toLocaleDateString().replace(/\//g, '-') + ' - ' + $ctrl.lastDateTime.toLocaleDateString().replace(/\//g, '-');
            var sheetName = fileName;
            var exportData = [];            
            // Headers:
            var headers = angular.copy($ctrl.labels);

            if ($ctrl.selectedChartType.type == 'single') {
                //Data:
                var data = angular.copy($ctrl.data)
                exportData.push(headers);
                exportData.push(data);                
            }

            else {
                headers.unshift("");
                exportData.push(headers);
                for (var s = 0; s < $ctrl.series.length; s++) {
                    var row = [];
                    row.push($ctrl.series[s]);
                    var dataMaxLength = Math.max.apply(Math, $ctrl.data.map(function (arr) { return arr.length; }))
                    for (var d = 0; d < dataMaxLength; d++) {
                        row.push($ctrl.data[s][d] || 0);
                    }
                    exportData.push(angular.copy(row));                   
                }
            }

            return {
                fileName: fileName,
                sheetName: sheetName,
                exportData: exportData
            }

            //var jsonToExport = [
            //    {
            //        "col1data": "1",
            //        "col2data": "Fight Club",
            //        "col3data": "Brad Pitt"
            //    },
            //    {
            //        "col1data": "2",
            //        "col2data": "Matrix (Series)",
            //        "col3data": "Keanu Reeves"
            //    },
            //    {
            //        "col1data": "3",
            //        "col2data": "V for Vendetta",
            //        "col3data": "Hugo Weaving"
            //    }
            //];


            //// Data:
            //angular.forEach(jsonToExport, function (value, key) {
            //    $ctrl.exportData.push([value.col1data, value.col2data, value.col3data]);
            //});
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
        $ctrl.changeChartType = changeChartType;
        $ctrl.reload = reload;
        $ctrl.exportToExcel = exportToExcel;
    }
})();