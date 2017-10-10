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
            .state('home.charts', {
                url: "/charts",
                data: {
                    pageTitle: 'Grafici'
                },
                views: {
                    'pages': {
                        template: '<charts>'
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
        .filter('titlecase', function () {
            return function (input) {
            if (input === undefined) { return null; }
            var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

            input = input.toLowerCase();
            return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function (match, index, title) {
                if (index > 0 && index + match.length !== title.length &&
                    match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                    (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                    title.charAt(index - 1).search(/[^\s-]/) < 0) {
                    return match.toLowerCase();
                }

                if (match.substr(1).search(/[A-Z]|\../) > -1) {
                    return match;
                }

                return match.charAt(0).toUpperCase() + match.substr(1);
            });
        }
    })
        .run(function () {
            String.prototype.formatStoreName = function () {
                return this.toLowerCase().replace(/ /g, '_');
            };            
        });
})();