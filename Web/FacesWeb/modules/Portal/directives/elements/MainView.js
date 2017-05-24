(function () {
    'use strict';

    angular.module('portal')
        .directive('mainView', mainViewDirective)
        .controller('MainViewController', MainViewController)

    function mainViewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Portal/directives/elements/templates/MainView.html',
            scope: true,
            controllerAs: 'vm'
        };
    }

    function MainViewController($rootScope, $scope, $mdSidenav, $state, $transitions, $uibModal, $timeout, AuthenticationService, UserService) {

        var vm = this;
        var _eventHandlers = [];

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function init() {
            if (!$scope.currentUser)
                $scope.currentUser = UserService.getCurrentUser();                        

            $scope.$on("$destroy", clean);

            //$http.get('config/site-config.json').success(function (data) {
            //    vm.config = data;
            //});
            
            vm.openMenuPanel = openMenuPanel();
            vm.openTreePanel = openTreePanel();
            vm.closeMenuPanel = closeMenuPanel;
            vm.closeTreePanel = closeTreePanel;
            vm.goTo = goTo;            
            vm.showSettings = showSettings;
            vm.logOut = logOut;           
        }        

        function openMenuPanel() {
            return debounce(function () {
                $mdSidenav('menu').open();
            }, 200)
        };

        function openTreePanel() {
            return debounce(function () {
                //$mdSidenav('tree').open();
                vm.isTreeOpen = true;
            }, 200)
        };

        function closeMenuPanel() {
            $mdSidenav('menu').close();
        };

        function closeTreePanel() {
            //$mdSidenav('tree').close();
            vm.isTreeOpen = false;
        };

        function goTo(state) {
            closeMenuPanel();
            $state.go(state, {}, { reload: false });           
        }        

        function showSettings() {
            closeMenuPanel();
            var modalInstance = $uibModal.open({
                templateUrl: 'controllers/templates/SettingsForm.html',
                controller: 'SettingsController as vm',
                size: 'sm'
            });
        }

        function logOut() {
            closeMenuPanel();
            $state.go('home', {}, { reload: false });
            AuthenticationService.logOut();
        }

        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }

        //vm.tree = [
        //    {
        //        label: 'Animal',
        //        children: [
        //            {
        //                label: 'Dog',
        //                data: {
        //                    description: "man's best friend"
        //                }
        //            }, {
        //                label: 'Cat',
        //                data: {
        //                    description: "Felis catus"
        //                }
        //            }, {
        //                label: 'Hippopotamus',
        //                data: {
        //                    description: "hungry, hungry"
        //                }
        //            }, {
        //                label: 'Chicken',
        //                children: ['White Leghorn', 'Rhode Island Red', 'Jersey Giant']
        //            }
        //        ]
        //    }, {
        //        label: 'Vegetable',
        //        data: {
        //            definition: "A plant or part of a plant used as food, typically as accompaniment to meat or fish, such as a cabbage, potato, carrot, or bean.",
        //            data_can_contain_anything: true
        //        },
        //        onSelect: function (branch) {
        //            return $scope.output = "Vegetable: " + branch.data.definition;
        //        },
        //        children: [
        //            {
        //                label: 'Oranges'
        //            }, {
        //                label: 'Apples',
        //                children: [
        //                    {
        //                        label: 'Granny Smith',
        //                        onSelect: ''
        //                    }, {
        //                        label: 'Red Delicous',
        //                        onSelect: ''
        //                    }, {
        //                        label: 'Fuji',
        //                        onSelect: ''
        //                    }
        //                ]
        //            }
        //        ]
        //    }, {
        //        label: 'Mineral',
        //        children: [
        //            {
        //                label: 'Rock',
        //                children: ['Igneous', 'Sedimentary', 'Metamorphic']
        //            }, {
        //                label: 'Metal',
        //                children: ['Aluminum', 'Steel', 'Copper']
        //            }, {
        //                label: 'Plastic',
        //                children: [
        //                    {
        //                        label: 'Thermoplastic',
        //                        children: ['polyethylene', 'polypropylene', 'polystyrene', ' polyvinyl chloride']
        //                    }, {
        //                        label: 'Thermosetting Polymer',
        //                        children: ['polyester', 'polyurethane', 'vulcanized rubber', 'bakelite', 'urea-formaldehyde']
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //];

        //vm.tree = [];

        //// This function handles arrays and objects
        //function searchNode(tree, node) {
        //    for (var _node in tree) {
        //        if (!tree.hasOwnProperty(_node))
        //            continue;

        //        if (tree[_node].label == node.Name && !tree[_node].children) {
        //            return tree[_node];
        //        }
        //        else if (tree[_node].children) {
        //            return searchNode(tree[_node].children, node);
        //        }              
        //    }
        //}

        //function addStores(fatherId) {
        //    //while (vm.stores.length != 0) {
        //        var rootLocations = $filter('filter')(vm.stores, { FatherID: fatherId });
        //        rootLocations.map(function (rootLocation) {
        //            var children = getChildren(rootLocation, vm.stores);
        //            if (fatherId) {
        //                var rootLocationNode = searchNode(vm.tree, rootLocation);
        //                if (rootLocationNode) {                            
        //                    rootLocationNode.children = children.map(function (child) {
        //                        return child.Name;
        //                    });
        //                }
        //            }
        //            else {

        //                vm.tree.push({
        //                    label: rootLocation.Name,
        //                    children: children.map(function (child) {
        //                        return { label: child.Name };
        //                    })
        //                });
        //            }

        //            vm.stores.splice(vm.stores.findIndex(x => x.Name == rootLocation.Name), 1);
        //            if (vm.stores.length != 0) {
        //                children.map(function (child) {
        //                    addStores(child.FatherID);
        //                });
        //            }

        //        });
        //    //}
        //}

        //function getChildren(location, stores) {
        //    return $filter('filter')(stores, { FatherID: location.ID });
        //}

        //$http.get("http://localhost:62696/odata/StoreTrees")
        //    .success(function (data, status) {
        //        vm.stores = data.value;
        //        addStores(null);
        //    })
        //    .error(function (data, status) {
        //    })

        init();

    }

    MainViewController.$inject = ['$rootScope', '$scope', '$mdSidenav', '$state', '$transitions', '$uibModal', '$timeout', 'AuthenticationService', 'UserService'];

})();