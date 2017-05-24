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
           
            vm.sexLabels = ["Males", "Females"];
            vm.glassesLabels = ["Glasses", "No Glasses"];
            vm.beardLabels = ["Beard", "Mustaches", "Nothing"];
            
            vm.options = {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                responsive: true,
                maintainAspectRatio: true
            }
        }

        function greaterThan (prop, val) {
            return function (item) {
                return item[prop] > val;
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

                var url = "http://localhost:62696/odata/Faces?$filter=ExitTimestamp eq null and "+ dateFilter + " " + cameraFilter;
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

                            vm.sexData = [males, females];
                            vm.glassesData = [glasses, noGlasses];
                            vm.beardData = [beard, mustaches, nothing]
                        }
                    }, function (error) {
                    });
            }
            else {                
                vm.sexData = [0, 0];
                vm.glassesData = [0, 0];
                vm.beardData = [0, 0, 0];
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