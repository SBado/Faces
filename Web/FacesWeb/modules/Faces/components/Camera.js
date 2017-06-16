(function () {
    'use strict';

    angular.module('faces')
        .component('camera', {
            templateUrl: 'modules/Faces/components/templates/Camera.html',            
            bindings: {
                recordedFaces: '<'
            }
        });    
})();