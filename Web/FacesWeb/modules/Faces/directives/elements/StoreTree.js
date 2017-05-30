//https://github.com/alarv/ng-login

(function () {
    'use strict';

    angular.module('portal')
        .directive('storeTree', storeTreeDirective)
        .controller('StoreTreeController', StoreTreeController)

    function storeTreeDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/StoreTree.html',
            controller: StoreTreeController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                selectedStore: '=',
                parentStores: '=',
                childStores: '=',
                cameras: '=',
                treeApi: '='
            },
            link: function (scope, element, attrs, controller) {
                
            }
        };
    }

    function StoreTreeController($rootScope, $filter, StoreTreeService, WebApiService) {

        var vm = this;
        var _treeData = [];
        var _noLeafTreeData = [];
        var _initialSelection = null;
        var _storeList = null;        
        var _childStores = {};
        var _parentStores = {};
        var _cameras = {};
        var _cameraList = null;
        var _zones = {};
        var _zoneList = null;

        function emptyArrayPredicate(prop) {
            return function (item) {
                return Array.isArray(item[prop]) && item[prop].length == 0;
            }
        }

        function thisInThatPredicate(thisProp, thatArray, thatProp) {
            return function (item) {
                //return array.indexOf(item[prop]) != -1;
                var expr = {};
                expr[thatProp] = item[thisProp];
                return $filter('filter')(thatArray, expr).length > 0;
            }
        }

        function searchNode(tree, node) {
            for (var n in tree) {
                if (!tree.hasOwnProperty(n))
                    continue;

                if (tree[n].data.ID == node.ID) {
                    return tree[n];
                }
                else if (tree[n].children && tree[n].children.length > 0) {
                    return searchNode(tree[n].children, node);
                }
            }
        }

        function getParentNodes(treeController, node) {
            var parents = [];
            var n = node;
            while (n.parent_uid) {
                var parent = treeController.get_parent_branch(n);
                parents.unshift(parent);
                n = parent;
            }

            return parents;
        }

        function getChildNodes(node) {
            var context = null;
            if (!this) {
                context = {
                    locations: [],
                    node: node,
                    currentNode: node
                };
            }
            else {
                context = this;
            }

            var children = $filter('filter')(context.currentNode.children, { data: { FatherID: context.currentNode.data.ID } });
            if (children.length) {
                children.map(function (child) {
                    context.locations.push(child)
                });
                children.map(function (child) {
                    context.currentNode = child;
                    return getChildNodes.call(context)
                });
            }

            return context.locations;
        }

        function getChildStores(stores, parent) {
            return $filter('filter')(stores, { FatherID: parent.ID });
        }

        function removeLeafNodes(node) {
            for (var i = 0; i < node.children.length; i++) {
                if (node.children[i].children.length == 0) {
                    node.children.splice(i, 1);
                    i--;
                }
                else {
                    removeLeafNodes(node.children[i]);
                }
            }
        }

        function getCompanies(tree) {
            return $filter('filter')(tree, { data: { FatherID: null } });
        }

        function getPhysicalStores(tree, companyList) {
            return $filter('filter')(tree, thisInThatPredicate('data.FatherID', companyList, 'data.ID'));
        }

        function getStoreCameras(cameraList, store) {
            var cameras = [];
            cameraList.map(function (camera) {
                if (camera.FatherID == store.data.ID || $filter('filter')(_childStores[store.data.ID], { data: { ID: camera.FatherID } }).length > 0) {
                    cameras.push(camera);
                }
            });
            return cameras;
        }

        function getStoreZones(zoneList, store) {
            var zones = [];
            zoneList.map(function (zone) {
                if (zone.FatherID == store.data.ID || $filter('filter')(_childStores[store.data.ID], { data: { ID: zone.FatherID } }).length > 0) {
                    zones.push(zone);
                }
            });
            return zones;
        }

        function addStores(fatherId) {
            var rootLocations = $filter('filter')(_storeList, { FatherID: fatherId });
            rootLocations.map(function (rootLocation) {
                var children = getChildStores(_storeList, rootLocation);
                if (fatherId) {
                    var rootLocationNode = searchNode(vm.treeData, rootLocation);
                    if (rootLocationNode) {
                        rootLocationNode.children = children.map(function (child) {
                            return {
                                label: child.Name,
                                data: child
                            };
                        });
                    }
                }
                else {
                    var node = {
                        label: rootLocation.Name,
                        children: children.map(function (child) {
                            return {
                                label: child.Name,
                                data: child
                            };
                        }),
                        data: rootLocation,
                        selected: _treeData.length == 0
                    };
                    _treeData.push(node);
                    if (node.selected) {
                        _initialSelection = node;
                    }
                }

                _storeList.splice(_storeList.findIndex(x => x.ID == rootLocation.ID), 1);
                if (_storeList.length != 0) {
                    children.map(function (child) {
                        addStores(child.FatherID);
                    });
                }

            });
            //}
        }

        function onSelectedStore(branch) {
            if (!vm.context.selectedStore || branch.data.ID != vm.context.selectedStore.data.ID) {
                vm.context.selectedStore = branch;
                //vm.selectedStore = branch;

                if (!_childStores[branch.data.ID]) {
                    _childStores[branch.data.ID] = getChildNodes(branch);
                }
                vm.context.childStores = _childStores[branch.data.ID];

                if (!_parentStores[branch.data.ID]) {
                    _parentStores[branch.data.ID] = getParentNodes(vm.tree, branch);
                }
                vm.context.parentStores = _parentStores[branch.data.ID];

                if (!_cameras[branch.data.ID]) {
                    _cameras[branch.data.ID] = getStoreCameras(_cameraList, branch);
                }
                vm.context.cameras = _cameras[branch.data.ID];

                if (!_zones[branch.data.ID]) {
                    _zones[branch.data.ID] = getStoreZones(_zoneList, branch);
                }
                vm.context.zones = _zones[branch.data.ID];

                //var arr2 = [];
                //var node2 = branch;
                //var a = vm.tree.get_next_branch(node2);
                //while (a) {
                //    arr2.push(a);
                //    node2 = a;
                //    a = vm.tree.get_next_branch(node2)
                //}                
            }
        }

        function selectStore(branch) {
            vm.tree.select_branch(branch);
        }

        function hideZones() {
            vm.treeData = _noLeafTreeData;
        }

        function showZones() {
            vm.treeData = _treeData;
        }

        function init() {
            vm.tree = {};
            vm.treeData = _treeData;
            vm.context = {};
            vm.context.companies = null;
            vm.context.physicalStores = null;
            vm.context.selectedStore = null;
            vm.context.parentStores = null;
            vm.context.childStores = null;
            vm.context.cameras = null;

            vm.onSelectedStore = onSelectedStore;
            vm.selectStore = selectStore;
            vm.showZones = showZones;
            vm.hideZones = hideZones;                        

            WebApiService.getStoreTrees()
                .then(function (response) {
                    if (response.status == 200) {
                        _storeList = $filter('filter')(response.data.value, { IsCamera: false });                        
                        _cameraList = $filter('filter')(response.data.value, { IsCamera: true });
                        _zoneList = $filter('filter')(response.data.value, { IsZone: true });
                        addStores(null);

                        vm.context.companies = getCompanies(vm.treeData);
                        vm.context.physicalStores = getPhysicalStores(vm.treeData, vm.context.companies);
                        
                        _noLeafTreeData = angular.copy(vm.treeData);
                        angular.forEach(_noLeafTreeData, removeLeafNodes);

                        StoreTreeService.context = vm.context;
                        StoreTreeService.storeTreeApi = {
                            selectStore: vm.selectStore,
                            hideZones: vm.hideZones,
                            showZones: vm.showZones
                        };

                        onSelectedStore(vm.treeData[0]);

                        $rootScope.$broadcast('tree-loaded');
                    }
                }, function (error) {
                });
        }

        init();

    }

    StoreTreeController.$inject = ['$rootScope', '$filter', 'StoreTreeService', 'WebApiService'];

})();