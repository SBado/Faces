(function () {
    "use strict";

    angular.module("faces")
        .factory("WebApiService", ['$http', '$q', 'StoreTreeService', WebApiService]);

    function WebApiService($http, $q, StoreTreeService) {

        console.log('WebApiService instantiated');

        var self = this;
        var baseUrl = "http://localhost:62696/odata";

        function getAll(url, options) {
            if (options) {
                url += '?' + options;
            }
            return $http.get(url);
        }

        function createEmptyResponse() {
            return $q.resolve({
                status: 200,
                data: { value: [] }
            });
        }

        self.getStoreTrees = function (options) {
            var url = baseUrl + '/StoreTrees';
            return getAll(url, options);
        }

        self.getFaces = function (options) {
            var url = baseUrl + '/Faces';
            return getAll(url, options);
        }

        self.getFacesInStore = function (date, cameras) {
            //var dateFilter = 'year(EntranceTimestamp) eq ' + date.getFullYear() +
            var dateFilter = 'year(EntranceTimestamp) eq ' + 2016 +
                ' and month(EntranceTimestamp) eq ' + (date.getMonth() + 1) +
                ' and day(EntranceTimestamp) eq ' + date.getDate();

            var cameraFilter = '';
            cameras.map(function (camera) {
                cameraFilter += 'EntranceCamera eq ' + camera.ID + ' or '
            });

            if (cameraFilter) {
                cameraFilter = cameraFilter.slice(0, -4);
                cameraFilter = " and (" + cameraFilter + ")";

                return self.getFaces('$filter=ExitTimestamp eq null and ' + dateFilter + ' ' + cameraFilter);
            }
            else {
                return createEmptyResponse();
            }
        }

        self.getBaskets = function (options) {
            var url = baseUrl + '/Baskets';
            return getAll(url, options);
        }

        self.getBasketsCount = function (options) {
            var url = baseUrl + '/Baskets/$count/';
            return getAll(url, options);
        }

        self.getBasketsInStore = function (zones) {
            var zoneFilter = '';
            zones.map(function (zone) {
                zoneFilter += 'CurrentZone eq ' + zone.ID + ' or '
            });

            if (zoneFilter) {
                zoneFilter = zoneFilter.slice(0, -4);
                return self.getBaskets('$filter=' + zoneFilter);
            }
            else {
                return createEmptyResponse();
            }
        }

        self.getBasketsInStoreCount = function (zones) {
            var zoneFilter = '';
            zones.map(function (zone) {
                zoneFilter += 'CurrentZone eq ' + zone.ID + ' or '
            });

            if (zoneFilter) {
                zoneFilter = zoneFilter.slice(0, -4);
                return self.getBasketsCount('$filter=' + zoneFilter);
            }
            else {
                return createEmptyResponse();
            }
        }

        return self;
    }
})();