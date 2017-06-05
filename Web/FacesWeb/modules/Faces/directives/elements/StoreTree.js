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

    function StoreTreeController($rootScope, $scope, $filter, StoreTreeService, WebApiService) {

        var vm = this;
        var _deregisterWatch = null;
        var _treeData = [];
        var _noLeafTreeData = [];
        var _initialSelection = null;
        var _storeList = null;
        var _companies = {};
        var _buildings = {};
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

        function searchBranch(tree, branch) {
            for (var n in tree) {
                if (!tree.hasOwnProperty(n))
                    continue;

                if (tree[n].data.ID == branch.ID) {
                    return tree[n];
                }
                else if (tree[n].children && tree[n].children.length > 0) {
                    return searchBranch(tree[n].children, branch);
                }
            }
        }

        function getParentBranches(treeController, branch) {
            var parents = [];
            var b = branch;
            while (b.parent_uid) {
                var parent = treeController.get_parent_branch(b);
                parents.unshift(parent);
                b = parent;
            }

            return parents;
        }

        function getParentBuilding(treeController, branch) {
            var b = branch;
            while (b.parent_uid) {
                var parent = treeController.get_parent_branch(b);
                if (parent.parent_uid) {
                    b = parent;
                }
                else {
                    return b;
                }
            }

            return null;
        }

        function getChildBranches(branch) {
            var context = null;
            if (!this) {
                context = {
                    locations: [],
                    branch: branch,
                    currentBranch: branch
                };
            }
            else {
                context = this;
            }

            var children = $filter('filter')(context.currentBranch.children, { data: { FatherID: context.currentBranch.data.ID } });
            if (children.length) {
                children.map(function (child) {
                    context.locations.push(child)
                });
                children.map(function (child) {
                    context.currentBranch = child;
                    return getChildBranches.call(context)
                });
            }

            return context.locations;
        }

        function getChildStores(stores, parent) {
            return $filter('filter')(stores, { FatherID: parent.ID });
        }

        //function removeLeafBranches(branch) {
        //    for (var i = 0; i < branch.children.length; i++) {
        //        if (branch.children[i].children.length == 0) {
        //            branch.children.splice(i, 1);
        //            i--;
        //        }
        //        else {
        //            removeLeafBranches(branch.children[i]);
        //        }
        //    }
        //}

        function getCompanies(stores) {
            return $filter('filter')(stores, { data: { FatherID: null } });
        }

        function getBuildings(treeData, treeController) {
            //return $filter('filter')(tree, thisInThatPredicate('data.FatherID', companyList, 'data.ID'));
            var buildings = [];
            treeData.map(function (branch) {
                buildings = buildings.concat(treeController.get_children(branch));
            });

            return buildings;
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
                    var rootLocationBranch = searchBranch(_treeData, rootLocation);
                    if (rootLocationBranch) {
                        rootLocationBranch.children = children.map(function (child) {
                            return {
                                label: child.Name,
                                data: child
                            };
                        });
                    }
                }
                else {
                    var branch = {
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
                    //vm.tree.add_root_branch(branch);
                    _treeData.push(branch);
                    if (branch.selected) {
                        _initialSelection = branch;
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

        function addBranch(parent, child) {                 
            if (child) {
                var branch = {
                    label: child.Name,
                    children: [],
                    data: child
                };
                vm.tree.add_branch(parent, branch);

                var children = getChildStores(_storeList, child);
                children.map(function (child) {
                    addBranch(branch, child);
                });
            }
            else {
                var rootBranch = {
                    label: parent.Name,
                    children: [],
                    data: parent,
                    //selected: vm.treeData.length == 0
                };
                vm.tree.add_root_branch(rootBranch);
                //if (rootBranch.selected) {
                //    _initialSelection = rootBranch;
                //}

                var children = getChildStores(_storeList, parent);
                children.map(function (child) {
                    addBranch(rootBranch, child);
                });
            }            
        }

        function onSelectedStore(branch) {
            if (!vm.context.store || branch.data.ID != vm.context.store.data.ID) {
                vm.context.store = branch;
                var storeId = branch.data.ID;

                if (!_childStores[storeId]) {
                    _childStores[storeId] = getChildBranches(branch);
                }
                vm.context.childStores = _childStores[storeId];

                if (!_parentStores[storeId]) {
                    _parentStores[storeId] = getParentBranches(vm.tree, branch);
                }
                vm.context.parentStores = _parentStores[storeId];

                if (!_companies[storeId]) {
                    var companies = $filter('filter')(_parentStores[storeId], { data: { FatherID: null } });
                    if (companies.length) {
                        _companies[storeId] = companies[0];
                    }
                    else {
                        _companies[storeId] = branch;
                    }
                }
                vm.context.company = _companies[storeId];

                if (!_buildings[storeId]) {
                    _buildings[storeId] = getParentBuilding(vm.tree, branch);
                }
                vm.context.building = _buildings[storeId];

                if (!_cameras[storeId]) {
                    _cameras[storeId] = getStoreCameras(_cameraList, branch);
                }
                vm.context.cameras = _cameras[storeId];

                if (!_zones[storeId]) {
                    _zones[storeId] = getStoreZones(_zoneList, branch);
                }
                vm.context.zones = _zones[storeId];
            }
        }

        function selectStore(branch) {
            vm.tree.select_branch(branch);
        }

        //function hideZones() {
        //    vm.treeData = _noLeafTreeData;
        //}

        //function showZones() {
        //    vm.treeData = _treeData;
        //}

        function init() {
            vm.tree = {};
            vm.treeData = [];
            vm.context = {
                tree: {}
            };
            vm.context.tree.companies = null;
            vm.context.tree.buildings = null;
            vm.context.company = null;
            vm.context.building = null;
            vm.context.store = null;
            vm.context.parentStores = null;
            vm.context.childStores = null;
            vm.context.zones = null;
            vm.context.cameras = null;

            vm.onSelectedStore = onSelectedStore;
            vm.selectStore = selectStore;
            //vm.showZones = showZones;
            //vm.hideZones = hideZones;           

            _deregisterWatch = $scope.$watch('vm.treeData', function (newValue, oldValue) {
                if (newValue == oldValue || (newValue.length && !newValue[0].uid)) {
                    return;
                }                

                _deregisterWatch();
                //_treeData.length = 0;
                //_noLeafTreeData.length = 0;
                //_treeData = angular.copy(vm.treeData);
                //_noLeafTreeData = angular.copy(vm.treeData);
                //angular.forEach(_noLeafTreeData, removeLeafBranches);

                vm.context.tree.companies = getCompanies(vm.treeData);
                vm.context.tree.buildings = getBuildings(vm.treeData, vm.tree);

                StoreTreeService.context = vm.context;
                StoreTreeService.storeTreeApi = {
                    selectStore: vm.selectStore,
                    //hideZones: vm.hideZones,
                    //showZones: vm.showZones
                };

                StoreTreeService.treeLoaded = true;
                $rootScope.$broadcast('tree-loaded');
                
            }, true)

            WebApiService.getStoreTrees()
                .then(function (response) {
                    if (response.status == 200) {
                        _storeList = $filter('filter')(response.data.value, { IsCamera: false });
                        _cameraList = $filter('filter')(response.data.value, { IsCamera: true });
                        _zoneList = $filter('filter')(response.data.value, { IsZone: true });

                        $filter('filter')(response.data.value, { FatherID: null }).map(function (root) {
                            addBranch(root);
                        });
                        //addStores(null);
                        //vm.treeData = _treeData;
                        //_treeData = angular.copy(vm.treeData);
                        //_noLeafTreeData = angular.copy(vm.treeData);
                        //angular.forEach(_noLeafTreeData, removeLeafBranches);                                                

                        vm.tree.select_branch(vm.treeData[0]);
                        //onSelectedStore(vm.treeData[0]);                  
                    }
                }, function (error) {
                });
        }

        init();

    }

    StoreTreeController.$inject = ['$rootScope', '$scope', '$filter', 'StoreTreeService', 'WebApiService'];

})();