(function () {
    'use strict';

    angular.module('portal')
        .directive('storeBreadcrumbs', storeBreadcrumbsDirective)
        .controller('StoreBreadcrumbsController', StoreBreadcrumbsController)

    function storeBreadcrumbsDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/StoreBreadcrumbs.html',
            controller: StoreBreadcrumbsController,
            controllerAs: 'vm',
            scope: true            
        };
    }

    function StoreBreadcrumbsController($scope) {

        var vm = this;
        var _watches = [];

        var selectStore = function (index) {
            vm.breadCrumbs.splice(index + 1);
            $scope.storeTreeApi.selectStore(vm.breadCrumbs[index].store)
        }

        function init() {
            _watches.push($scope.$watch('selectedStore', reload, true));
            $scope.$on("$destroy", clean);            
        }

        function reload() {
            vm.breadCrumbs = [];

            if ($scope.selectedStore) {                

                if ($scope.parentStores) {
                    $scope.parentStores.map(function (store) {
                        vm.breadCrumbs.push({
                            store: store,
                            label: store.label
                        });
                    });
                }

                vm.breadCrumbs.push({
                    store: $scope.selectedStore,
                    label: $scope.selectedStore.label
                });
            }
        }

        function clean() {
            for (var i = 0; i < _watches.length; i++) {
                _watches[i]();
            }
        }

        vm.selectStore = selectStore;

        init();
        
    }

    StoreBreadcrumbsController.$inject = ['$scope'];

})();