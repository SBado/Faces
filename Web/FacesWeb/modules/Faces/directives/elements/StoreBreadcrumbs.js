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
            scope: {}            
        };
    }

    function StoreBreadcrumbsController($scope, StoreTreeService) {

        var vm = this;
        var _treeLoadedEvent = null;
        var _watches = [];

        var selectStore = function (index) {
            vm.breadCrumbs.splice(index + 1);
            StoreTreeService.storeTreeApi.selectStore(vm.breadCrumbs[index].store);
        }

        function init() {
            _watches.push($scope.$watch(function () {
                return StoreTreeService.context.store;
            }, reload, true));
            $scope.$on("$destroy", clean);          
        }

        function reload() {
            vm.breadCrumbs = [];

            if (StoreTreeService.context.store) {                

                if (StoreTreeService.context.parentStores) {
                    StoreTreeService.context.parentStores.map(function (store) {
                        vm.breadCrumbs.push({
                            store: store,
                            name: store.Name
                        });
                    });
                }

                vm.breadCrumbs.push({
                    store: StoreTreeService.context.store,
                    name: StoreTreeService.context.store.Name
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

    StoreBreadcrumbsController.$inject = ['$scope', 'StoreTreeService'];

})();