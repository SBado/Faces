(function () { // Angular encourages module pattern, good!
    var app = angular.module('myApp', []),
        //uri = 'api/StoreTrees',
        uri = 'odata/StoreTreesOD',
        errorMessage = function (data, status) {
            return 'Error: ' + status +
                (data.Message !== undefined ? (' ' + data.Message) : '');
        },
        hub = $.connection.facesHub; // create a proxy to signalr hub on web server

    app.controller('myCtrl', ['$http', '$scope', function ($http, $scope) {
        $scope.stores = [];
        $scope.storeNameSubscribed;

        //$scope.getAllFromStoreTree = function () {
        //    if ($scope.storeName.length == 0) return;
        //    $http.get(uri + '/GetStoreTreeByName?name=' + $scope.storeName)
        //        .success(function (data, status) {
        //            $scope.stores = data; // show current stores
        //            if ($scope.storeNameSubscribed &&
        //                $scope.storeNameSubscribed.length > 0 &&
        //                $scope.storeNameSubscribed !== $scope.storeName) {
        //                // unsubscribe to stop to get notifications for old customer
        //                hub.server.unsubscribe($scope.storeNameSubscribed);
        //            }
        //            // subscribe to start to get notifications for new customer
        //            hub.server.subscribe($scope.storeName.toLowerCase());
        //            $scope.storeNameSubscribed = $scope.storeName.toLowerCase();
        //        })
        //        .error(function (data, status) {
        //            $scope.complaints = [];
        //            $scope.errorToSearch = errorMessage(data, status);
        //        })
        //};

        $scope.getAllFromStoreTree = function () {
            if ($scope.storeName.length == 0) return;
            $http.get(uri + "?$filter=Name eq '" + $scope.storeName + "'")
                .success(function (data, status) {
                    $scope.stores = data.value;
                    if ($scope.storeNameSubscribed &&
                        $scope.storeNameSubscribed.length > 0 &&
                        $scope.storeNameSubscribed !== $scope.storeName) {
                        // unsubscribe to stop to get notifications for old customer
                        hub.server.unsubscribe($scope.storeNameSubscribed);
                    }
                    // subscribe to start to get notifications for new customer
                    hub.server.subscribe($scope.storeName.toLowerCase());
                    $scope.storeNameSubscribed = $scope.storeName.toLowerCase();
                })
                .error(function (data, status) {
                    $scope.complaints = [];
                    $scope.errorToSearch = errorMessage(data, status);
                })
        };

        //$scope.putOne = function () {
        //    $http.put(uri + '/' + $scope.idToUpdate, {
        //        ID: $scope.idToUpdate,                
        //        Description: $scope.descToUpdate,
        //        Name: $scope.selectedStore.Name,
        //        IsCamera: $scope.selectedStore.IsCamera,
        //        IsZone: $scope.selectedStore.IsZone,
        //        FatherID: $scope.selectedStore.FatherID
        //    })
        //        .success(function (data, status) {
        //            $scope.errorToUpdate = null;
        //            $scope.idToUpdate = null;
        //            $scope.descToUpdate = null;
        //            $scope.selectedStore = null;
        //        })
        //        .error(function (data, status) {
        //            $scope.errorToUpdate = errorMessage(data, status);
        //        })
        //};

        $scope.putOne = function () {
            $http.patch(uri + '(' + $scope.idToUpdate + ')', {                
                Description: $scope.descToUpdate,               
            })
                .success(function (data, status) {
                    $scope.errorToUpdate = null;
                    $scope.idToUpdate = null;
                    $scope.descToUpdate = null;
                    $scope.selectedStore = null;
                })
                .error(function (data, status) {
                    $scope.errorToUpdate = errorMessage(data, status);
                })
        };

        $scope.editIt = function (item) {
            $scope.idToUpdate = item.ID;
            $scope.descToUpdate = item.Description;
            $scope.selectedStore = item;
        };
        
        $scope.toShow = function () {
            return $scope.stores && $scope.stores.length > 0;
        };

        // at initial page load
        $scope.orderProp = 'Name'; 

        hub.client.updateItem = function (item) {
            var array = $scope.stores;
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i].ID === item.ID) {
                    array[i].Description = item.Description;
                    $scope.$apply();
                }
            }
        }

        $.connection.hub.start(); // connect to signalr hub
    }]);
})();