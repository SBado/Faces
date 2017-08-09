(function () {
    'use strict';

    angular.module('faces')
        .component('graphs', {
            templateUrl: 'modules/Faces/components/templates/Graphs.html',
            controller: GraphsController
        });

    function GraphsController($rootScope, $http, $filter, $q, StoreTreeService, OdataService, moment) {

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
            $ctrl.labels = [];
            $ctrl.data = [];
            $ctrl.characteristics = [
                { name: 'Sesso', labels: ['Donne', 'Uomini'], possibleValues: ['F', 'M'], id: 'Gender', canGroup: true },
                { name: 'Età', labels: ['0-12', '13-19', '20-60', '60+'], id: 'Age', canGroup: false },
                { name: 'Occhiali', labels: ['Con occhiali', 'Senza occhiali'], possibleValues: [true, false], id: 'Eyeglasses', canGroup: true },
                { name: 'Baffi', labels: ['Con baffi', 'Senza baffi'], id: 'Mustaches', canGroup: false },
                { name: 'Barba', labels: ['Con barba', 'Senza barba'], id: 'Beard', canGroup: false }
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

            if (!$ctrl.selectedCharacteristic.canGroup) {
                //return;
            }

            $rootScope.loadingContent = true;

            $ctrl.labels.length = 0;
            $ctrl.data.length = 0;

            var diff = moment.preciseDiff($ctrl.startDate, $ctrl.endDate, true)
            var firstMonth = $ctrl.startDate.getMonth();
            var firstYear = $ctrl.startDate.getFullYear();
            var numberOfMonths = diff.months;
            if (diff.seconds || diff.minutes || diff.hours || diff.days) {
                numberOfMonths++;
            }

            var dateFilters = [];
            var loopNumber = 0;
            var lastMonth = firstMonth;
            var year = firstYear;
            for (var i = firstMonth; i < 13; i = (i + 1) % 12) {
                $ctrl.labels.push(months[i] + ' ' + year);
                if (lastMonth > i) {
                    year++;
                }
                dateFilters.push(
                    {
                        index: loopNumber,
                        year: year,
                        month: i,
                        days: days[i]
                    }
                )
                loopNumber++;
                if (loopNumber == numberOfMonths) {
                    break;
                }

                lastMonth = i;
            }

            //$ctrl.labels = ['Gen', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
            $ctrl.series = $ctrl.selectedCharacteristic.labels;

            $ctrl.data = [
                new Array(numberOfMonths),
                new Array(numberOfMonths)
            ];

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

            var context = StoreTreeService.getContext();

            if (!context.store) {
                //setChartsEmpty($ctrl.charts);
                return;
            }

            dateFilters.map(d => {
                var xIndex = d.index;
                OdataService.getFaces(new Date(d.year, d.month, 1),
                    context.cameras,
                    new Date(d.year, d.month, d.days),
                    true,
                    [$ctrl.selectedCharacteristic.id],
                    { property: 'ID', transformation: 'countdistinct', alias: 'total' }
                ).then(function (response) {
                    $rootScope.loadingContent = false;
                    if (response.status == 200 && response.data.value.length) {
                        for (var i = 0; i < $ctrl.selectedCharacteristic.labels.length; i++) {
                            var total = $filter('filter')(response.data.value, function (val) {
                                if (val[$ctrl.selectedCharacteristic.id] == $ctrl.selectedCharacteristic.possibleValues[i]) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            })[0].total;
                            $ctrl.data[i][xIndex] = total;
                        }
                        //$ctrl.data[1][xIndex] = response.data.value[1].total;
                    }
                    else {
                        //setChartsEmpty($ctrl.charts);
                    }
                }, function (error) { $rootScope.loadingContent = false; })
            });
        }

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
        $ctrl.reload = reload;
    }
})();