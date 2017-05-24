(function () {
    "use strict";

    angular.module("faces")
        .factory("WebApiService", ['$http', WebApiService]);

    function WebApiService($http) {

        console.log('WebApiService instantiated');

        var self = this;
        var baseUrl = "http://localhost:62696/odata";

        self.getStoreTrees = function (options) {
            var url = baseUrl + '/StoreTrees';
            if (options) {
                url += '?' + options;
            }
            return $http.get(url);
        }

        self.getFaces = function (options) {
            var url = baseUrl + '/Faces';
            if (options) {
                url += '?' + options;
            }
            return $http.get(url);            
        }

        return self;
    }
})();