(function () {
    'use strict';

    angular.module('faces')
        .component('camerasOverview', {
            templateUrl: 'modules/Faces/components/templates/CamerasOverview.html',
            controller: CamerasOverviewController
        });

    function CamerasOverviewController($http, $filter, StoreTreeService, OdataService) {

        var $ctrl = this;
        var _subscription = null;

        function init() {
            $ctrl.cameraList = [];
            _subscription = StoreTreeService.subscribe(reload);

            if (StoreTreeService.getContext()) {
                reload();
            }
        }

        function reload() {
            $ctrl.cameraList.length = 0;
            var context = StoreTreeService.getContext();

            OdataService.getCamerasFacesCount(context.cameras)
                .then(function (response) {
                    if (response.status == 200) {
                        var cameras = [];
                        response.data.value.map(function (camera) {
                            var recordedFaces = camera["FacesIn@odata.count"] + camera["FacesOut@odata.count"]
                            $ctrl.cameraList.push({
                                ID: camera.ID,
                                Name: camera.Name,
                                TotalRecordedFaces: recordedFaces,
                                TodayRecordedFaces: 0
                            });
                        })

                        OdataService.getCamerasFacesCount(context.cameras, new Date())
                            .then(function (response) {
                                if (response.status == 200) {
                                    var cameras = [];
                                    response.data.value.map(function (camera) {
                                        var recordedFaces = camera["FacesIn@odata.count"] + camera["FacesOut@odata.count"]
                                        $filter('filter')($ctrl.cameraList, { ID: camera.ID })[0].TodayRecordedFaces = recordedFaces
                                    });
                                }
                            }, function (error) {
                            });
                    }
                }, function (error) {
                });
        }

        function clean() {
            _subscription.dispose();
        }

        $ctrl.$onInit = init;
        $ctrl.$onDestroy = clean;
    }
})();