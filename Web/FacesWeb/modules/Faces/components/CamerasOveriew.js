(function () {
    'use strict';

    angular.module('faces')
        .component('camerasOverview', {
            templateUrl: 'modules/Faces/components/templates/CamerasOverview.html',
            controller: CamerasOverviewController
        });       

    function CamerasOverviewController($http) {

        var ctrl = this;        

        function init() {
            $http.get("http://localhost:62696/odata/StoreTrees?$filter=IsCamera eq true")
                .then(function (response) {
                    if (response.status == 200) {

                        $http.get("http://localhost:62696/odata/Faces?$filter=EntranceCamera eq true")
                            .then(function (response) {
                                if (response.status == 200) {
                                }
                            })                        
                    }
                }, function (error) {
                });
        }

        ctrl.$onInit = init;
    }
})();