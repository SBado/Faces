(function () {
    'use strict';

    angular.module('portal')
        .directive('mainView', mainViewDirective)
        .controller('MainViewController', MainViewController)

    function mainViewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/MainView.html',
            scope: true,
            controllerAs: 'vm'
        };
    }

    function MainViewController($rootScope, $scope, $mdSidenav, $state, $uibModal, $timeout, AuthenticationService, UserService) {

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

            _eventHandlers.push($rootScope.$on('$stateChangeSuccess', function (e, curr, prev) {
                setPageTitle(curr.name);
            }));
            $scope.$on("$destroy", clean);

            //$http.get('config/site-config.json').success(function (data) {
            //    vm.config = data;
            //});

            vm.pageTitle = '';
            vm.openLeftSideNavPanel = openLeftSideNavPanel();
            vm.openRightSideNavPanel = openRightSideNavPanel();
            vm.closeLeftSideNavPanel = closeLeftSideNavPanel;
            vm.closeRightSideNavPanel = closeRightSideNavPanel;
            vm.goTo = goTo;
            vm.goToDayScheduler = goToDayScheduler;
            vm.showSettings = showSettings;
            vm.logOut = logOut;
        }
        function setPageTitle(state) {
            switch (state) {
                case 'home.manualcontrol':
                    vm.pageTitle = 'Manual Control';
                    break;
                case 'home.dayscheduler':
                case 'home.dayscheduler.daytemperatures':
                    vm.pageTitle = 'Day Scheduler';
                    break;
                case 'home.weekscheduler':
                    vm.pageTitle = 'Week Scheduler';
                    break;
                case 'home.monthscheduler':
                    vm.pageTitle = 'Month Scheduler';
                    break;
                default:
                    vm.pageTitle = 'Climate Control';
            }
        }
        function openLeftSideNavPanel() {
            return debounce(function () {
                $mdSidenav('left').open();
            }, 200)
        };
        function openRightSideNavPanel() {
            return debounce(function () {
                $mdSidenav('right').open();
            }, 200)
        };
        function closeLeftSideNavPanel() {
            $mdSidenav('left').close();
        };
        function closeRightSideNavPanel() {
            $mdSidenav('right').close();
        };
        function goTo(state) {
            closeLeftSideNavPanel();
            $state.go(state, {}, { reload: false });
            setPageTitle(state);
        }
        function goToDayScheduler() {
            closeLeftSideNavPanel();
            $state.go('home.dayscheduler.daytemperatures', { 'day': TimeService.currentDay }, { reload: false });
            setPageTitle('home.dayscheduler.daytemperatures');
        }
        function showSettings() {
            closeLeftSideNavPanel();
            var modalInstance = $uibModal.open({
                templateUrl: 'controllers/templates/SettingsForm.html',
                controller: 'SettingsController as vm',
                size: 'sm'
            });
        }
        function logOut() {
            closeLeftSideNavPanel();
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

    MainViewController.$inject = ['$rootScope', '$scope', '$mdSidenav', '$state', '$uibModal', '$timeout', 'AuthenticationService', 'UserService'];

})();