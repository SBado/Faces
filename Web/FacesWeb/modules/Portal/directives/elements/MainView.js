(function () {
    'use strict';

    angular.module('portal')
        .directive('mainView', mainViewDirective)
        .controller('MainViewController', MainViewController)

    function mainViewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'modules/Portal/directives/elements/templates/MainView.html',
            controller: 'MainViewController',
            scope: true,
            controllerAs: 'vm'            
        };
    }

    function MainViewController($rootScope, $scope, $mdSidenav, $state, $transitions, $uibModal, $timeout, AuthenticationService, UserService) {

        var vm = this;
        var _eventHandlers = [];

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function init() {
            if (!$scope.currentUser)
                $scope.currentUser = UserService.getCurrentUser();                        

            $scope.$on("$destroy", clean);

            //$http.get('config/site-config.json').success(function (data) {
            //    vm.config = data;
            //});
            
            vm.openMenuPanel = openMenuPanel();
            vm.openTreePanel = openTreePanel();
            vm.closeMenuPanel = closeMenuPanel;
            vm.closeTreePanel = closeTreePanel;
            vm.goTo = goTo;            
            vm.showSettings = showSettings;
            vm.logOut = logOut;           
        }        

        function openMenuPanel() {
            return debounce(function () {
                $mdSidenav('menu').open();
            }, 200)
        };

        function openTreePanel() {
            return debounce(function () {
                //$mdSidenav('tree').open();
                vm.isTreeOpen = true;
            }, 200)
        };

        function closeMenuPanel() {
            $mdSidenav('menu').close();
        };

        function closeTreePanel() {
            //$mdSidenav('tree').close();
            vm.isTreeOpen = false;
        };

        function goTo(state) {
            closeMenuPanel();
            $state.go(state, {}, { reload: false });           
        }        

        function showSettings() {
            closeMenuPanel();
            var modalInstance = $uibModal.open({
                templateUrl: 'controllers/templates/SettingsForm.html',
                controller: 'SettingsController as vm',
                size: 'sm'
            });
        }

        function logOut() {
            closeMenuPanel();
            $state.go('home', {}, { reload: false });
            AuthenticationService.logOut();
        }

        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }
    
        init();

    }

    MainViewController.$inject = ['$rootScope', '$scope', '$mdSidenav', '$state', '$transitions', '$uibModal', '$timeout', 'AuthenticationService', 'UserService'];

})();