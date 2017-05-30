(function () {
    "use strict";

    angular.module("faces")
        .factory("StoreTreeService", [StoreTreeService]);

    function StoreTreeService() {

        console.log('StoreTreeService instantiated');

        var self = this;

        self.context = {};                
        self.storeTreeApi = null;              

        return self;
    }
})();