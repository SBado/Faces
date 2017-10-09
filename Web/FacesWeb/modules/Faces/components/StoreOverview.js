(function () {
    'use strict';

    angular.module('faces')
        .component('storeOverview', {
            templateUrl: 'modules/Faces/components/templates/StoreOverview.html',
            controller: StoreOverviewController
        });

    function StoreOverviewController($scope, $filter, StoreTreeService, OdataService, UtilityService) {
        var $ctrl = this;        
        var _subscription = null;
        var _locations = {};
        var _cameras = {};
        var _faces = null;
        var _cameraList = null;
        var _emptyChartOverride = { borderWidth: 0.5, borderColor: ['rgba(0,0,0,1)'], backgroundColor: ['rgba(255, 255, 255, 1)'] };

        function init() {
            _subscription = StoreTreeService.subscribe(reload);

            var options = {
                title: {
                    display: true,
                    text: ''
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                responsive: true,
                maintainAspectRatio: true,
                tooltips: {
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
                },
                pieceLabel: {
                    mode: 'percentage',
                    precision: 2
                }
            }

            $ctrl.charts = {};
            $ctrl.charts['Sex'] = {
                id: 'sex',
                labels: ['Maschi', 'Femmine'],
            };
            $ctrl.charts['Age'] = {
                id: 'age',
                labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70+'],
            };
            //$ctrl.charts['Glasses'] = {
            //    id: 'glasses',
            //    labels: ['Con Occhiali', 'Senza Occhiali'],
            //};
            //$ctrl.charts['Beard'] = {
            //    id: 'beard',
            //    labels: ['Barba', 'Baffi', 'Niente'],
            //};

            angular.forEach($ctrl.charts, function (chart) {
                chart.emptyLabel = ['Nessun dato'];
                chart.dataLabels = chart.labels;
                chart.data = null;
                chart.options = angular.copy(options);
                chart.chartsOverride = null;
            });

            $ctrl.charts.Sex.options.title.text = 'Sesso';
            $ctrl.charts.Age.options.title.text = 'Età';
            //$ctrl.charts.Glasses.options.title.text = 'Occhiali';
            //$ctrl.charts.Beard.options.title.text = 'Barba';

            if (StoreTreeService.getContext()) {
                reload();
            }
        }        

        function setChartEmpty(chart) {
            if (!chart.dataLabels) {
                chart.dataLabels = chart.labels;
            }
            chart.labels = chart.emptyLabel;
            chart.data = [1];
            chart.chartsOverride = _emptyChartOverride;
        }

        function setChartsEmpty(charts) {
            angular.forEach(charts, function (chart) {
                setChartEmpty(chart);
            });
        }

        function setChartValues(chart, data) {
            var sum = 0;
            data.map(value => sum += value);
            if (sum) {
                chart.labels = chart.dataLabels;
                chart.data = data;
                chart.chartsOverride = null;
            }
            else {
                setChartEmpty(chart);
            }
        }

        function reload() {
            var context = StoreTreeService.getContext();

            if (!context.store) {
                setChartsEmpty($ctrl.charts);
                return;
            }

            $ctrl.today = new Date();

            OdataService.getFacesInStore([{
                firstDateTime: new Date($ctrl.today.getFullYear(), $ctrl.today.getMonth(), $ctrl.today.getDate())
            }], context.cameras).then(function (response) {
                if (response.status == 200 && response.data.value.length) {
                    _faces = response.data.value;
                    $ctrl.totalFaces = response.data.value.length;

                    //var males = $filter('filter')(_faces, { Gender: 'M' }).length;                    
                    //var females = _faces.length - males;
                    var sexes = $filter('countBy')(_faces, 'Gender');
                    var males = sexes.M;
                    var females = sexes.F;

                    //var glasses = $filter('filter')(_faces, { Eyeglasses: true }).length;
                    //var noGlasses = _faces.length - glasses;
                    var eyeGlasses = $filter('countBy')(_faces, 'Eyeglasses');
                    var glasses = eyeGlasses.true;
                    var noGlasses = eyeGlasses.false;

                    var beard = $filter('filter')(_faces, UtilityService.greaterThanPredicate('Beard', 0)).length;
                    var mustaches = $filter('filter')(_faces, UtilityService.greaterThanPredicate('Mustaches', 0)).length;
                    var nothing = _faces.length > (beard + mustaches) ? _faces.length - (beard + mustaches) : 0;                    

                    var children = $filter('filter')(_faces, UtilityService.lessThanPredicate('Age', 12, true)).length;
                    var teens = $filter('filter')(_faces, UtilityService.betweenPredicate('Age', 12, 19, false, true)).length;
                    var adults = $filter('filter')(_faces, UtilityService.betweenPredicate('Age', 19, 60, false, true)).length;
                    var elders = $filter('filter')(_faces, UtilityService.greaterThanPredicate('Age', 60)).length;

                    setChartValues($ctrl.charts.Sex, [males, females]);
                    //setChartValues($ctrl.charts.Glasses, [glasses, noGlasses]);
                    //setChartValues($ctrl.charts.Beard, [beard, mustaches, nothing]);
                    setChartValues($ctrl.charts.Age, [children, teens, adults, elders]);
                }
                else {
                    setChartsEmpty($ctrl.charts);
                }
            }, function (error) {
            });
        }

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
    }
})();