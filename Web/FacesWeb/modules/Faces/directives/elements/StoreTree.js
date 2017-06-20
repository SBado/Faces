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
            controllerAs: 'ctrl',
            scope: {},
            bindToController: {
                selectedStore: '=',
                parentStores: '=',
                childStores: '=',
                cameras: '='                
            },
            link: function (scope, element, attrs, controller) {

            }
        };
    }

    function StoreTreeController($rootScope, $scope, $filter, StoreTreeService, OdataService) {

        var ctrl = this;
        var _context = {
            tree: {}
        };        
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
        var _deregisterWatch = null;

        function emptyArrayPredicate(prop) {
            return function (item) {
                return Array.isArray(item[prop]) && item[prop].length == 0;
            }
        }

        function getParentStores(treeController, branch) {
            var parents = [];
            var b = branch;
            while (b.parent_uid) {
                var parent = treeController.get_parent_branch(b);
                parents.unshift(parent.data);
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
                    return b.data;
                }
            }

            return null;
        }

        function getChildren(stores, parent) {
            return $filter('filter')(stores, { FatherID: parent.ID });
        }

        function getChildStores(branch) {
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
                    context.locations.push(child.data)
                });
                children.map(function (child) {
                    context.currentBranch = child;
                    return getChildStores.call(context)
                });
            }

            return context.locations;
        }        

        function getCompanies(stores) {
            return ($filter('filter')(stores, { data: { FatherID: null } })).map(company => company.data);
        }

        function getBuildings(treeData, treeController) {
            var buildings = [];
            treeData.map(branch => buildings = buildings.concat(treeController.get_children(branch)));

            return buildings.map(building => building.data);
        }

        function getStoreCameras(cameraList, branch) {
            var cameras = [];
            cameraList.map(camera => {
                if (camera.FatherID == branch.data.ID || $filter('filter')(_childStores[branch.data.ID], { ID: camera.FatherID }).length > 0) {
                    cameras.push(camera);
                }
            });
            return cameras;
        }

        function getStoreZones(zoneList, branch) {
            var zones = [];
            zoneList.map(zone => {
                if (zone.FatherID == branch.data.ID || $filter('filter')(_childStores[branch.data.ID], { ID: zone.FatherID }).length > 0) {
                    zones.push(zone);
                }
            });
            return zones;
        }

        function getStoreBranch(treeData, store) {
            for (var p in treeData) {
                if (!treeData.hasOwnProperty(p))
                    continue;

                if (treeData[p].data.ID == store.ID) {
                    return treeData[p];
                }
                else if (treeData[p].children && treeData[p].children.length > 0) {
                    return getStoreBranch(treeData[p].children, store);
                }
                else return null;
            }
        }

        function addBranch(parent, child) {
            if (child) {
                var branch = {
                    label: child.Name,
                    children: [],
                    data: child
                };
                ctrl.tree.add_branch(parent, branch);

                var children = getChildren(_storeList, child);
                children.map(child => addBranch(branch, child));
            }
            else {
                var rootBranch = {
                    label: parent.Name,
                    children: [],
                    data: parent,
                    //selected: ctrl.treeData.length == 0
                };
                ctrl.tree.add_root_branch(rootBranch);
                //if (rootBranch.selected) {
                //    _initialSelection = rootBranch;
                //}

                var children = getChildren(_storeList, parent);
                children.map(child => addBranch(rootBranch, child));
            }
        }

        function onSelectedStore(branch) {
            if (!_context.store || branch.data.ID != _context.store.ID) {
                _context.store = branch.data;
                var storeId = branch.data.ID;

                if (!_childStores[storeId]) {
                    _childStores[storeId] = getChildStores(branch);
                }
                _context.childStores = _childStores[storeId];

                if (!_parentStores[storeId]) {
                    _parentStores[storeId] = getParentStores(ctrl.tree, branch);
                }
                _context.parentStores = _parentStores[storeId];

                if (!_companies[storeId]) {
                    var companies = $filter('filter')(_parentStores[storeId], { FatherID: null });
                    if (companies.length) {
                        _companies[storeId] = companies[0];
                    }
                    else {
                        _companies[storeId] = branch.data;
                    }
                }
                _context.company = _companies[storeId];

                if (!_buildings[storeId]) {
                    _buildings[storeId] = getParentBuilding(ctrl.tree, branch);
                }
                _context.building = _buildings[storeId];

                if (!_cameras[storeId]) {
                    _cameras[storeId] = getStoreCameras(_cameraList, branch);
                }
                _context.cameras = _cameras[storeId];

                if (!_zones[storeId]) {
                    _zones[storeId] = getStoreZones(_zoneList, branch);
                }
                _context.zones = _zones[storeId];
            }
        }

        function _selectStore(branch) {
            ctrl.tree.select_branch(branch);
        }

        function selectStore(store) {
            ctrl.tree.select_branch(getStoreBranch(ctrl.treeData, store));
        }

        function init() {
            ctrl.tree = {};
            ctrl.treeData = [];
            
            _context.tree.companies = null;
            _context.tree.buildings = null;
            _context.company = null;
            _context.building = null;
            _context.store = null;
            _context.parentStores = null;
            _context.childStores = null;
            _context.zones = null;
            _context.cameras = null;

            ctrl.onSelectedStore = onSelectedStore;

            _deregisterWatch = $scope.$watch('ctrl.treeData', function (newValue, oldValue) {
                if (newValue == oldValue || (newValue.length && !newValue[0].uid)) {
                    return;
                }

                _deregisterWatch();                

                _context.tree.companies = getCompanies(ctrl.treeData);
                _context.tree.buildings = getBuildings(ctrl.treeData, ctrl.tree);

                StoreTreeService.context = _context;
                StoreTreeService.storeTreeApi = {
                    selectStore: selectStore                    
                };

                StoreTreeService.treeLoaded = true;
                $rootScope.$broadcast('tree-loaded');

            }, true)

            OdataService.getStoreTrees()
                .then(function (response) {
                    if (response.status == 200) {
                        _storeList = $filter('filter')(response.data.value, { IsCamera: false });
                        _cameraList = $filter('filter')(response.data.value, { IsCamera: true });
                        _zoneList = $filter('filter')(response.data.value, { IsZone: true });

                        $filter('filter')(response.data.value, { FatherID: null }).map(root => addBranch(root));                       
                        ctrl.tree.select_branch(ctrl.treeData[0]);                                     
                    }
                }, function (error) {
                });
        }

        init();

    }

    StoreTreeController.$inject = ['$rootScope', '$scope', '$filter', 'StoreTreeService', 'OdataService'];

})();


//function thisInThatPredicate(thisProp, thatArray, thatProp) {
//    return function (item) {
//        //return array.indexOf(item[prop]) != -1;
//        var expr = {};
//        expr[thatProp] = item[thisProp];
//        return $filter('filter')(thatArray, expr).length > 0;
//    }
//}

//function searchBranch(tree, branch) {
//    for (var n in tree) {
//        if (!tree.hasOwnProperty(n))
//            continue;

//        if (tree[n].data.ID == branch.ID) {
//            return tree[n];
//        }
//        else if (tree[n].children && tree[n].children.length > 0) {
//            return searchBranch(tree[n].children, branch);
//        }
//    }
//}

//function addStores(fatherId) {
//    var rootLocations = $filter('filter')(_storeList, { FatherID: fatherId });
//    rootLocations.map(function (rootLocation) {
//        var children = getChildren(_storeList, rootLocation);
//        if (fatherId) {
//            var rootLocationBranch = searchBranch(_treeData, rootLocation);
//            if (rootLocationBranch) {
//                rootLocationBranch.children = children.map(function (child) {
//                    return {
//                        label: child.Name,
//                        data: child
//                    };
//                });
//            }
//        }
//        else {
//            var branch = {
//                label: rootLocation.Name,
//                children: children.map(function (child) {
//                    return {
//                        label: child.Name,
//                        data: child
//                    };
//                }),
//                data: rootLocation,
//                selected: _treeData.length == 0
//            };
//            //ctrl.tree.add_root_branch(branch);
//            _treeData.push(branch);
//            if (branch.selected) {
//                _initialSelection = branch;
//            }
//        }

//        _storeList.splice(_storeList.findIndex(x => x.ID == rootLocation.ID), 1);
//        if (_storeList.length != 0) {
//            children.map(function (child) {
//                addStores(child.FatherID);
//            });
//        }

//    });
//    //}
//}