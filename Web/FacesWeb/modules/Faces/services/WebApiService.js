(function () {
    "use strict";

    angular.module("faces")
        .factory("WebApiService", ['$http', WebApiService]);

    function WebApiService($http) {

        console.log('WebApiService instantiated');

        var self = this;
        var baseUrl = "http://localhost:62696/odata";

        function getAll(url, options) {
            if (options) {
                url += '?' + options;
            }
            return $http.get(url);   
        }        

        self.getStoreTrees = function (options) {
            var url = baseUrl + '/StoreTrees';
            return getAll(url, options);
        }

        self.getFaces = function (options) {
            var url = baseUrl + '/Faces';
            return getAll(url, options);     
        }

        self.getBaskets = function (options) {
            var url = baseUrl + '/Baskets';
            return getAll(url, options);     
        }

        return self;
    }
})();