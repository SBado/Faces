(function () {
    "use strict";

    angular.module("faces")
        .factory("ChartService", ['$filter', 'moment', 'UtilityService', ChartService]);

    function ChartService($filter, moment, UtilityService) {

        var self = this;

        var months = [
            'Gen',
            'Feb',
            'Mar',
            'Apr',
            'Mag',
            'Giu',
            'Lug',
            'Ago',
            'Set',
            'Ott',
            'Nov',
            'Dic'
        ]

        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]        

        var loopMonths = function (firstMonth, firstYear, numberOfMonths, fn, param) {            
            var loopNumber = 0;
            var lastSelectedMonth = firstMonth;
            var year = firstYear;
            for (var i = firstMonth; i < 13; i = (i + 1) % 12) {
                if (lastSelectedMonth > i) {
                    year++;
                }

                fn(param, i, year, loopNumber);
                
                loopNumber++;
                if (loopNumber == numberOfMonths) {
                    break;
                }
                lastSelectedMonth = i;
            }
        }

        var createMonthLabel = function (labelList, month, year) {
            labelList.push(months[month] + ' ' + year);
        }

        var createMonthFilter = function (filterList, month, year, index) {
            filterList.push({
                index: index,
                year: year,
                month: month,
                days: days[month]
            })
        }
        
        self.getNumberOfMonths = function (startDate, endDate) {
            var startMonth = startDate.getMonth();
            var startYear = startDate.getFullYear();
            var endMonth = endDate.getMonth();
            var endYear = endDate.getFullYear();

            if (startYear == endYear) {
                if (endMonth >= startMonth) {
                    return endMonth - startMonth + 1;
                }
                else {
                    return endMonth + (11 - startMonth + 1) + 1;
                }
            }
            else {
                var diff = endYear - startYear;
                return endMonth + (11 - startMonth + 1 + (diff - 1) * 11) + 1;
            }
                        
        }

        self.getMonthLabels = function (startDate, endDate) {
            var labelList = [];
            loopMonths(startDate.getMonth(), startDate.getFullYear(), self.getNumberOfMonths(startDate, endDate), createMonthLabel, labelList);
            return labelList;
        }
        
        self.getMonthFilters = function (startDate, endDate) {
            var dateFilters = [];
            loopMonths(startDate.getMonth(), startDate.getFullYear(), self.getNumberOfMonths(startDate, endDate), createMonthFilter, dateFilters);
            return dateFilters;
        }

        self.getCharacteristicGroupsCount = function (characteristic, values) {
            var counts = [];
            for (var i = 0; i < characteristic.labels.length; i++) {
                var total = $filter('filter')(values, function (val) {
                    if (val[characteristic.id] == characteristic.possibleValues[i]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })[0].total;
                counts.push(total);
            }

            return counts;
        }

        self.getCharacteristicCount = function (characteristic, values) {
            var counts = [];
            for (var i = 0; i < characteristic.labels.length; i++) {
                var filteredValues = $filter('filter')(values, function (val) {
                    var values = characteristic.possibleValues[i].values;
                    var op = characteristic.possibleValues[i].operators;

                    if (values.length == 1) {
                        if (UtilityService.operators[op](val[characteristic.id], values[0])) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        if (UtilityService.operators[op](val[characteristic.id], values[0], values[1])) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                });
                counts.push(filteredValues.length);
            }

            return counts;
        }

        return self;
    }
})();