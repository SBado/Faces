(function () {
    'use strict';

    angular.module('portal')
        .component('storeBreadcrumbs', {
            templateUrl: 'modules/Faces/components/templates/StoreBreadcrumbs.html',
            controller: StoreBreadcrumbsController
        })            

    function StoreBreadcrumbsController($scope, StoreTreeService) {

        var $ctrl = this;        
        var _subscription = null;

        var selectStore = function (index) {
            $ctrl.breadCrumbs.splice(index + 1);
            StoreTreeService.getApi().selectStore($ctrl.breadCrumbs[index].store);
        }

        function init() {                    
            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function reload() {
            var context = StoreTreeService.getContext();

            $ctrl.breadCrumbs = [];
            if (context.store) {                

                if (context.parentStores) {
                    context.parentStores.map(store =>
                        $ctrl.breadCrumbs.push({
                            store: store,
                            name: store.Name
                        }));
                }

                $ctrl.breadCrumbs.push({
                    store: context.store,
                    name: context.store.Name
                });
            }
        }

        function clean() {           
            _subscription.dispose();
        }

        $ctrl.selectStore = selectStore;
        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
        
    }
})();