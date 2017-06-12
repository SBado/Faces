(function () {
    'use strict';

    angular.module('faces')
        .component('storeOverview', {
            templateUrl: 'modules/Faces/components/templates/StoreOverview.html',
            controller: StoreOverviewController
        });

    function StoreOverviewController($scope, $filter, $http, StoreTreeService, WebApiService) {
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
                labels: ['Males', 'Females'],
            };
            $ctrl.charts['Age'] = {
                id: 'age',
                labels: ['0-12', '13-19', '20-60', '60+'],
            };
            $ctrl.charts['Glasses'] = {
                id: 'glasses',
                labels: ['Glasses', 'No Glasses'],
            };
            $ctrl.charts['Beard'] = {
                id: 'beard',
                labels: ['Beard', 'Mustaches', 'Nothing'],
            };

            angular.forEach($ctrl.charts, function (chart) {
                chart.emptyLabel = ['No data'];
                chart.dataLabels = chart.labels;
                chart.data = null;
                chart.options = angular.copy(options);
                chart.chartsOverride = null;
            });

            $ctrl.charts.Sex.options.title.text = 'Sex';
            $ctrl.charts.Age.options.title.text = 'Age';
            $ctrl.charts.Glasses.options.title.text = 'Glasses';
            $ctrl.charts.Beard.options.title.text = 'Beard';

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function greaterThanPredicate(prop, val) {
            return function (item) {
                return item[prop] > val;
            }
        }

        function lessThanPredicate(prop, val) {
            return function (item) {
                return item[prop] < val;
            }
        }

        function betweenPredicate(prop, minVal, maxVal) {
            return function (item) {
                return minVal <= item[prop] <= maxVal;
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

            WebApiService.getFacesInStore(new Date(), context.cameras).then(function (response) {
                if (response.status == 200 && response.data.value.length) {
                    _faces = response.data.value;

                    var males = $filter('filter')(_faces, { Gender: 'M' }).length;
                    var females = _faces.length - males;
                    var glasses = $filter('filter')(_faces, { Eyeglasses: true }).length;
                    var noGlasses = _faces.length - glasses;
                    var beard = $filter('filter')(_faces, greaterThanPredicate('Beard', 0)).length;
                    var mustaches = $filter('filter')(_faces, greaterThanPredicate('Beard', 0)).length;
                    var nothing = _faces.length > (beard + mustaches) ? _faces.length - (beard + mustaches) : 0;
                    var children = $filter('filter')(_faces, lessThanPredicate('Age', 13)).length;
                    var teens = $filter('filter')(_faces, betweenPredicate('Age', 13, 19)).length;
                    var adults = $filter('filter')(_faces, betweenPredicate('Age', 20, 60)).length;
                    var elders = $filter('filter')(_faces, greaterThanPredicate('Age', 60)).length;

                    setChartValues($ctrl.charts.Sex, [males, females]);
                    setChartValues($ctrl.charts.Glasses, [glasses, noGlasses]);
                    setChartValues($ctrl.charts.Beard, [beard, mustaches, nothing]);
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