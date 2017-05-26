//https://github.com/alarv/ng-login

(function () {
    'use strict';

    angular.module('faces')
        .directive('cameraList', cameraListDirective)
        .controller('CameraListController', CameraListController)

    function cameraListDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Faces/directives/elements/templates/CameraList.html',
            controller: CameraListController,
            controllerAs: 'vm',
            scope: true,
            bindToController: {
                cameraList: '='
            }
        };
    }

    function CameraListController($http) {

        var vm = this;        

        $http.get("http://localhost:62696/odata/StoreTrees?$filter=IsCamera eq true")
            .then(function (response) {
                if (response.status == 200) {
                    vm.cameraList = response.data.value;                    
                }
            }, function (error) {
            });
    }

    CameraListController.$inject = ['$http'];

})();