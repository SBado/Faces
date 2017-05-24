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
                controller.treeApi = {
                    selectStore: controller.tree.select_branch
                };
            }
        };
    }

    function StoreTreeController($http, $filter, WebApiService) {

        var vm = this;
        var _initialSelection = null;
        var _storeList = null;
        var _childStores = {};
        var _parentStores = {};
        var _cameras = {};
        var _cameraList = null;

        function searchNode(tree, node) {
            for (var n in tree) {
                if (!tree.hasOwnProperty(n))
                    continue;

                if (tree[n].data.ID == node.ID && !tree[n].children) {
                    return tree[n];
                }
                else if (tree[n].children && tree[n].children.length > 0) {
                    return searchNode(tree[n].children, node);
                }
            }
        }

        function searchNodeById(tree, nodeId) {
            for (var n in tree) {
                if (!tree.hasOwnProperty(n))
                    continue;

                if (tree[n].data.ID == nodeId) {
                    return tree[n];
                }
                else if (tree[n].children && tree[n].children.length > 0) {
                    return searchNodeById(tree[n].children, nodeId);
                }
            }

        }

        function getParentNodes(treeController, node) {
            //var context = null;
            //if (!this) {
            //    context = { parents: [] };
            //}
            //else {
            //    context = this;
            //}
            //if (node.data.FatherID) {
            //    var parent = searchNodeById(vm.treeData, node.data.FatherID);
            //    if (parent) {
            //        context.parents.unshift(parent); 
            //        if (parent.data.FatherID) {
            //            return getParentNodes.call(context, tree, parent);
            //        }
            //    }
            //}
            //return context.parents;

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

        function getCameras(store) {
            var cameras = [];
            _cameraList.map(function (camera) {
                if (camera.FatherID == store.data.ID || $filter('filter')(_childStores[store.data.ID], { data: { ID: camera.FatherID }}).length > 0) {
                    cameras.push(camera);                    
                }
            });
            return cameras;
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
                        selected: vm.treeData.length == 0
                    };
                    vm.treeData.push(node);
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

        function selectStore(branch) {
            if (!vm.selectedStore || branch.data.ID != vm.selectedStore.data.ID) {
                vm.selectedStore = branch;

                if (!_childStores[branch.data.ID]) {
                    _childStores[branch.data.ID] = getChildNodes(branch);                    
                }
                vm.childStores = _childStores[branch.data.ID];

                if (!_parentStores[branch.data.ID]) {
                    _parentStores[branch.data.ID] = getParentNodes(vm.tree, branch);
                }
                vm.parentStores = _parentStores[branch.data.ID];

                if (!_cameras[branch.data.ID]) {
                    _cameras[branch.data.ID] = getCameras(branch);                    
                }
                vm.cameras = _cameras[branch.data.ID];
                                
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

        function init() {
            vm.tree = {};
            vm.treeData = [];
            vm.selectedStore = null;
            vm.parentStores = null;
            vm.childStores = null;
            vm.selectStore = selectStore;                    

            WebApiService.getStoreTrees()
                .then(function (response) {
                    if (response.status == 200) {
                        _storeList = $filter('filter')(response.data.value, { IsCamera: false });
                        _cameraList = $filter('filter')(response.data.value, { IsCamera: true });
                        addStores(null);
                        selectStore(vm.treeData[0]);
                    }
                }, function (error) {
                });
        }

        init();
        
    }

    StoreTreeController.$inject = ['$http', '$filter', 'WebApiService'];

})();