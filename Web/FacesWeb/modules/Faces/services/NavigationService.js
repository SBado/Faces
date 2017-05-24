(function () {
    "use strict";

    angular.module("faces")
        .factory("NavigationService", [NavigationService]);

    function NavigationService($rootScope, $timeout, $interval) {

        console.log('NavigationService instantiated');

        var self = this;

        self.selectedStore = null;
        self.parentStores = null;
        self.childStores = null;
        self.cameras = null;

        
        self.selectStore = function (store) { };
        init();

        return self;
    }
})();