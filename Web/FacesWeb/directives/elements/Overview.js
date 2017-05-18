(function () {
    'use strict';

    angular.module('portal')
        .directive('overview', overviewDirective)
        .controller('OverviewController', OverviewController)

    function overviewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/Overview.html',
            scope: true,
            controllerAs: 'vm'
        };
    }

    function OverviewController() {
        var vm = this;
    }

    OverviewController.$inject = [];

})();