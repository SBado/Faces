(function () {
    'use strict';

    angular.module('faces')
        .directive('overview', overviewDirective)
        .controller('OverviewController', OverviewController)

    function overviewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/Overview.html',
            scope: true,
            controllerAs: 'vm'
        };
    }

    function OverviewController($scope, $filter, $http) {
        var vm = this;
        var _watches = [];
        var _locations = {};
        var _cameras = {};
        var _faces = null;
        var _cameraList = null;

        function init() {
            _watches.push($scope.$watch('selectedStore', reload, true));
            $scope.$on("$destroy", clean);

            var options = {
                title: {
                    display: true,
                    text: ''
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                responsive: false,
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

            vm.charts = {};
            vm.charts['Sex'] = {
                id: 'sex',
                labels: ["Males", "Females"],
                data: null,
                options: angular.copy(options)
            };
            vm.charts['Age'] = {
                id: 'age',
                labels: ["0-12", "13-19", "20-60", "60+"],
                data: null,
                options: angular.copy(options)
            };
            vm.charts['Glasses'] = {
                id: 'glasses',
                labels: ["Glasses", "No Glasses"],
                data: null,
                options: angular.copy(options)
            };
            vm.charts['Beard'] = {
                id: 'beard',
                labels: ["Beard", "Mustaches", "Nothing"],
                data: null,
                options: angular.copy(options)
            };            

            vm.charts.Sex.options.title.text = 'Sex';
            vm.charts.Age.options.title.text = 'Age'; 
            vm.charts.Glasses.options.title.text = 'Glasses';
            vm.charts.Beard.options.title.text = 'Beard';                       
        }

        function greaterThan(prop, val) {
            return function (item) {
                return item[prop] > val;
            }
        }

        function lessThan(prop, val) {
            return function (item) {
                return item[prop] < val;
            }
        }

        function between(prop, minVal, maxVal) {
            return function (item) {
                return minVal <= item[prop] <= maxVal;
            }
        }

        function reload() {
            if (!$scope.selectedStore) {
                return;
            }
            var root = $scope.selectedStore;

            var dateFilter = '';
            var dateObj = new Date();
            var year = dateObj.getFullYear();
            var month = dateObj.getMonth() + 1; //months from 1-12
            var day = dateObj.getDate();
            dateFilter = 'year(EntranceTimestamp) eq ' + year + ' and month(EntranceTimestamp) eq ' + month + ' and day(EntranceTimestamp) eq ' + day;

            var cameraFilter = '';
            $scope.cameras.map(function (camera) {
                console.log('EntranceCamera = ' + camera.ID);
                cameraFilter += 'EntranceCamera eq ' + camera.ID + ' or '
            });

            if (cameraFilter) {
                cameraFilter = cameraFilter.slice(0, -4);
                cameraFilter = " and (" + cameraFilter + ")";

                var url = "http://localhost:62696/odata/Faces?$filter=ExitTimestamp eq null and " + dateFilter + " " + cameraFilter;
                $http.get(url)
                    .then(function (response) {
                        if (response.status == 200) {
                            _faces = response.data.value;

                            var males = $filter('filter')(_faces, { Gender: 'M' }).length;
                            var females = _faces.length - males;
                            var glasses = $filter('filter')(_faces, { Eyeglasses: true }).length;
                            var noGlasses = _faces.length - glasses;
                            var beard = $filter('filter')(_faces, greaterThan('Beard', 0)).length;
                            var mustaches = $filter('filter')(_faces, greaterThan('Beard', 0)).length;
                            var nothing = _faces.length > (beard + mustaches) ? _faces.length - (beard + mustaches) : 0;
                            var children = $filter('filter')(_faces, lessThan('Age', 13)).length;
                            var teens = $filter('filter')(_faces, between('Age', 13, 19)).length;
                            var adults = $filter('filter')(_faces, between('Age', 20, 60)).length;
                            var elders = $filter('filter')(_faces, greaterThan('Age', 60)).length;

                            vm.charts.Sex.data = [males, females];
                            vm.charts.Glasses.data = [glasses, noGlasses];
                            vm.charts.Beard.data = [beard, mustaches, nothing];
                            vm.charts.Age.data = [children, teens, adults, elders];
                        }
                    }, function (error) {
                    });
            }
            else {
                vm.charts.Sex.data = [0, 0];
                vm.charts.Glasses.data = [0, 0];
                vm.charts.Beard.data = [0, 0, 0];
                vm.charts.Age.data = [0, 0, 0, 0];
            }

        }

        function clean() {
            for (var i = 0; i < _watches.length; i++) {
                _watches[i]();
            }
        }

        init();
    }

    OverviewController.$inject = ['$scope', '$filter', '$http'];

})();