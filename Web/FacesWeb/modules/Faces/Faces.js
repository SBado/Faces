(function () {
    var app = angular.module('faces', ['portal', 'rx', 'angular.filter', 'angularBootstrapNavTree', 'chart.js', 'heatmap', 'angularMoment']);

    app.config(['$stateProvider', '$urlRouterProvider', '$mdDateLocaleProvider', function ($stateProvider, $urlRouterProvider, $mdDateLocaleProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/home/overview");

        $stateProvider
            .state('home.overview', {
                url: "/overview",
                data: {
                    pageTitle: 'Overview'
                },
                views: {
                    'pages': {
                        template: "<store-overview>"
                    }
                }
            })
            .state('home.baskets', {
                url: "/baskets",
                data: {
                    pageTitle: 'Carrelli'
                },
                views: {
                    'pages': {
                        template: '<baskets-overview>'
                    }
                }
            })
            .state('home.cameras', {
                url: "/cameras",
                data: {
                    pageTitle: 'Videocamere'
                },
                views: {
                    'pages': {
                        template: '<cameras-overview>'
                    }
                }
            })
            .state('home.graphs', {
                url: "/graphs",
                data: {
                    pageTitle: 'Grafici'
                },
                views: {
                    'pages': {
                        template: '<graphs>'
                    }
                }
            });

        // Italian localization.
        $mdDateLocaleProvider.months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        $mdDateLocaleProvider.shortMonths = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        $mdDateLocaleProvider.days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        $mdDateLocaleProvider.shortDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        // Can change week display to start on Monday.
        $mdDateLocaleProvider.firstDayOfWeek = 1;

        // Optional.
        //$mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, ...];

        // Example uses moment.js to parse and format dates.
        $mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, 'L', 'it', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.formatDate = function (date) {
            moment.locale('it');
            var m = moment(date);
            return m.isValid() ? m.format('L') : '';
        };

        $mdDateLocaleProvider.monthHeaderFormatter = function (date) {
            return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
        };

        // In addition to date display, date components also need localized messages
        // for aria-labels for screen-reader users.

        $mdDateLocaleProvider.weekNumberFormatter = function (weekNumber) {
            return 'Settimana ' + weekNumber;
        };

        $mdDateLocaleProvider.msgCalendar = 'Calendario';
        $mdDateLocaleProvider.msgOpenCalendar = 'Apri il calendario';

        // You can also set when your calendar begins and ends.
        //$mdDateLocaleProvider.firstRenderableDate = new Date(1776, 6, 4);
        //$mdDateLocaleProvider.lastRenderableDate = new Date(2012, 11, 21);

    }])
        .run(function () {
            String.prototype.formatStoreName = function () {
                return this.toLowerCase().replace(/ /g, '_');
            };
        });
})();