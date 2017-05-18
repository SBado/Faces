//https://github.com/alarv/ng-login

(function () {
    'use strict';

    angular.module('portal')
        .directive('storeTree', storeTreeDirective)
        .controller('StoreTreeController', StoreTreeController)

    function storeTreeDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/StoreTree.html',
            controller: StoreTreeController,
            controllerAs: 'vm',
            scope: {}
        };
    }

    function StoreTreeController($http, $filter) {

        var vm = this;
     
        vm.tree = [];
        
        function searchNode(tree, node) {
            for (var _node in tree) {
                if (!tree.hasOwnProperty(_node))
                    continue;

                if (tree[_node].label == node.Name && !tree[_node].children) {
                    return tree[_node];
                }
                else if (tree[_node].children) {
                    return searchNode(tree[_node].children, node);
                }
            }
        }

        function addStores(fatherId) {
            //while (vm.stores.length != 0) {
            var rootLocations = $filter('filter')(vm.stores, { FatherID: fatherId });
            rootLocations.map(function (rootLocation) {
                var children = getChildren(rootLocation, vm.stores);
                if (fatherId) {
                    var rootLocationNode = searchNode(vm.tree, rootLocation);
                    if (rootLocationNode) {
                        rootLocationNode.children = children.map(function (child) {
                            return child.Name;
                        });
                    }
                }
                else {

                    vm.tree.push({
                        label: rootLocation.Name,
                        children: children.map(function (child) {
                            return { label: child.Name };
                        })
                    });
                }

                vm.stores.splice(vm.stores.findIndex(x => x.Name == rootLocation.Name), 1);
                if (vm.stores.length != 0) {
                    children.map(function (child) {
                        addStores(child.FatherID);
                    });
                }

            });
            //}
        }

        function getChildren(location, stores) {
            return $filter('filter')(stores, { FatherID: location.ID });
        }

        $http.get("http://localhost:62696/odata/StoreTrees")
            .success(function (data, status) {
                vm.stores = data.value;
                addStores(null);
            })
            .error(function (data, status) {
            })
    }

    StoreTreeController.$inject = ['$http', '$filter'];

})();