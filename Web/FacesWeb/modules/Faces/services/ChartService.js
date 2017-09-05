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

        /*
        // https://stackoverflow.com/a/18479176 //
        function getWeekNumber(d) {
            // Copy date so don't modify original
            d = new Date(+d);
            d.setHours(0, 0, 0);
            // Set to nearest Thursday: current date + 4 - current day number
            // Make Sunday's day number 7
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            // Get first day of year
            var yearStart = new Date(d.getFullYear(), 0, 1);
            // Calculate full weeks to nearest Thursday
            var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
            // Return array of year and week number
            return [d.getFullYear(), weekNo];
        }        

        function weeksInYear(year) {
            var d = new Date(year, 11, 31);
            var week = getWeekNumber(d)[1];
            return week == 1 ? getWeekNumber(d.setDate(24))[1] : week;
        }
        ////
        */

        // https://stackoverflow.com/a/19570985 //
        function isLeapYear(y) { return !((y % 4) || (!(y % 100) && (y % 400))); };
        ////

        // https://stackoverflow.com/a/18538272 //
        function weeksInYear(y) {
            var d, isLeap;

            d = new Date(y, 0, 1);
            //isLeap = new Date(y, 1, 29).getMonth() === 1; //https://stackoverflow.com/a/8175905
            isLeap = isLeapYear(y);

            //check for a Jan 1 that's a Thursday or a leap year that has a 
            //Wednesday jan 1. Otherwise it's 52
            return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52
        }
        ////

        // https://stackoverflow.com/a/18479176 //
        function getWeekNumber(d) {
            // Copy date so don't modify original
            d = new Date(+d);
            d.setHours(0, 0, 0);
            // Set to nearest Thursday: current date + 4 - current day number
            // Make Sunday's day number 7
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            // Get first day of year
            var yearStart = new Date(d.getFullYear(), 0, 1);
            // Calculate full weeks to nearest Thursday
            var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
            // Return array of year and week number
            return weekNo;
        }
        ////

        // https://stackoverflow.com/a/16591175 //
        function getDateOfWeek(w, y) {
            var simpleWeek = new Date(y, 0, 1 + (w - 1) * 7);
            var dow = simpleWeek.getDay();
            var ISOweekStart = simpleWeek;
            if (dow <= 4)
                ISOweekStart.setDate(simpleWeek.getDate() - simpleWeek.getDay() + 1);
            else
                ISOweekStart.setDate(simpleWeek.getDate() + 8 - simpleWeek.getDay());
            return ISOweekStart;
        }
        ////

        function getMonthsOfWeek(w, y) {
            var ISOweekStart = getDateOfWeek(w, y);                        
            var ISOWeekEnd = angular.copy(ISOweekStart);
            ISOWeekEnd.setDate(ISOweekStart.getDate() + 6);
            var startMonth = ISOweekStart.getMonth();
            var endMonth = ISOWeekEnd.getMonth()
            var monthList = [];
            monthList.push(startMonth);
            if (startMonth != endMonth) {                
                monthList.push(endMonth);
            }
            return monthList;
        }



        function getNumberOfDays(startDate, endDate) {
            return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        }

        function loopDays(startDate, numberOfDays, fn, param) {
            var loopNumber = 0;            
            var year = startDate.getFullYear();
            var month = startDate.getMonth();
            var daysInMonth = days[month];
            var lastSelectedMonth = month;
            var lastSelectedDay = startDate.getDate();            
            for (var day = lastSelectedDay; day <= daysInMonth; day = (day + 1) % (daysInMonth + 1)) {
                if (!day) {
                    day = 1;
                }
                if (lastSelectedDay > day) {
                    month++;
                    daysInMonth = days[month];

                    if (lastSelectedMonth > month) {
                        year++;
                    }
                }

                fn(param, new Date(year, month, day, 0, 0, 0), loopNumber);

                loopNumber++;
                if (loopNumber == numberOfDays) {
                    break;
                }
                lastSelectedDay = day;
                lastSelectedMonth = month;
            }
        }

        function createDayLabel(labelList, date) {
            labelList.push(date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
        }

        function createDayFilter(filterList, firstDate, index) {
            var lastDate = angular.copy(firstDate);
            lastDate.setHours(23, 59, 59);
            filterList.push({
                index: index,
                firstDate: firstDate,
                lastDate: lastDate,
                //year: year,
                //months: [month, month],
                //firstDay: day,
                //lastDay: day,
                //firstHour: 0,
                //firstMinute: 0,
                //lastHour: 23,
                //lastMinute: 59
            })
        }

        function getDayLabels(startDate, endDate) {
            var labelList = [];
            loopDays(startDate, getNumberOfDays(startDate, endDate), createDayLabel, labelList);
            return labelList;
        }

        function getDayFilters(startDate, endDate) {
            var dateFilters = [];
            loopDays(startDate, getNumberOfDays(startDate, endDate), createDayFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfWeeks(startDate, endDate) {
            var startWeek = getWeekNumber(startDate);
            var startYear = startDate.getFullYear();
            var endWeek = getWeekNumber(endDate);
            var endYear = endDate.getFullYear();

            if (startYear == endYear) {
                return endWeek - startWeek + 1;
            }
            else {
                var firstYearWeeks = weeksInYear(startYear) - startWeek + 1;
                var lastYearWeeks = endWeek;
                var yearsWeeks = 0;

                for (var y = startYear + 1; y < endYear; y++) {
                    yearsWeeks += weeksInYear(y);
                }

                return firstYearWeeks + yearsWeeks + lastYearWeeks;
            }

        } 

        function loopWeeks(startDate, numberOfWeeks, fn, param) {
            var loopNumber = 0;
            var year = startDate.getFullYear();
            var weeksForYear = weeksInYear(year);  
            var lastSelectedWeek = getWeekNumber(startDate);                                  
            for (var week = lastSelectedWeek; week <= weeksForYear; week = ((week + 1) % (weeksForYear + 1))) {
                if (week == 0) {
                    week++;
                }
                if (lastSelectedWeek > week) {
                    year++;
                    weeksInYear(year)
                }

                fn(param, getDateOfWeek(week, year), loopNumber);

                loopNumber++;
                if (loopNumber == numberOfWeeks) {
                    break;
                }
                lastSelectedWeek = week;
            }
        }

        function createWeekLabel(labelList, date) {
            var monthLabel = '';
            var yearLabel = '';
            var lastDate = new Date(date.getDate() + 6);

            var firstMonth = date.getMonth();
            var lastMonth = lastDate.getMonth();
            if (firstMonth != lastMonth) {
                monthLabel = firstMonth + '/' + lastMonth;
            }
            else {
                monthLabel = firstMonth;
            }

            var firstYear = date.getFullYear();
            var lastYear = lastDate.getFullYear();
            if (firstYear != lastYear) {
                yearLabel = firstYear + '/' + lastYear;
            }
            else {
                yearLabel = firstYear;
            }

            labelList.push(monthLabel + ' ' + yearLabel + '-' + getWeekNumber(date));
        }

        function createWeekFilter(filterList, firstDate, index) {            
            var lastDate = angular.copy(firstDate);
            lastDate.setDate(lastDate.getDate() + 6);            
            //if (monthList.length == 1) {
            //    monthList.push(monthList[0]);
            //}
            lastDate.setHours(23, 59, 59);

            filterList.push({
                index: index,
                firstDate: firstDate,
                lastDate: lastDate,
                //year: year,                
                //months: monthList,
                //firstDay: date.getDate(),
                //lastDay: lastDate.getDate(),
                //firstHour: 0,
                //firstMinute: 0,
                //lastHour: 23,
                //lastMinute: 59
            })
        }

        function getWeekLabels(startDate, endDate) {
            var labelList = [];
            loopWeeks(startDate, getNumberOfWeeks(startDate, endDate), createWeekLabel, labelList);
            return labelList;
        }

        function getWeekFilters(startDate, endDate) {
            var dateFilters = [];
            loopWeeks(startDate, getNumberOfWeeks(startDate, endDate), createWeekFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfMonths(startDate, endDate) {
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
                return endMonth + (11 - startMonth + 1 + (diff - 1) * 12) + 1;
            }

        }

        function loopMonths (startDate, numberOfMonths, fn, param) {            
            var loopNumber = 0;
            var year = startDate.getFullYear();
            var lastSelectedMonth = startDate.getMonth();                     
            for (var month = lastSelectedMonth; month < 13; month = (month + 1) % 12) {
                if (lastSelectedMonth > month) {
                    year++;
                }

                fn(param, new Date(year, month, 1, 0, 0, 0), loopNumber);
                
                loopNumber++;
                if (loopNumber == numberOfMonths) {
                    break;
                }
                lastSelectedMonth = month;
            }
        }

        function createMonthLabel(labelList, date) {
            labelList.push(months[date.getMonth()] + ' ' + date.getFullYear());
        }

        function createMonthFilter(filterList, firstDate, index) {
            var lastDate = angular.copy(firstDate);
            lastDate.setDate(days[lastDate.getMonth()]);
            lastDate.setHours(23, 59, 59);
            filterList.push({
                index: index,
                firstDate: firstDate,
                lastDate: lastDate,
                //year: year,
                //months: [month, month],
                //firstDay: 1,
                //lastDay: days[month],
                //firstHour: 0,
                //firstMinute: 0,
                //lastHour: 23,
                //lastMinute: 59
            })
        }

        function getMonthLabels(startDate, endDate) {
            var labelList = [];
            loopMonths(startDate, getNumberOfMonths(startDate, endDate), createMonthLabel, labelList);
            return labelList;
        }

        function getMonthFilters(startDate, endDate) {
            var dateFilters = [];
            loopMonths(startDate, getNumberOfMonths(startDate, endDate), createMonthFilter, dateFilters);
            return dateFilters;
        }

        function compareCharacteristicPredicate(characteristic, index) {
            return function (value) {
                var values = characteristic.possibleValues[index].values;
                var op = characteristic.possibleValues[index].operators;

                if (values.length == 1) {
                    if (UtilityService.operators[op](value[characteristic.id], values[0])) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (UtilityService.operators[op](value[characteristic.id], values[0], values[1])) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        }

        self.temporalDetail = {
            day: 'd',
            week: 'w',
            month: 'm'
        }

        self.characteristicType = {
            single: 's',
            multiple: 'm'
        }        

        self.getWeekNumber = getWeekNumber;
                                                  
        self.getCharacteristicGroupsCount = function (characteristic, values) {
            var counts = [];
            for (var i = 0; i < characteristic.labels.length; i++) {
                var total = $filter('filter')(values, compareCharacteristicPredicate(characteristic, i))[0].total;
                counts.push(total);
            }

            return counts;
        }

        self.getCharacteristicCount = function (characteristic, values) {
            var counts = [];
            for (var i = 0; i < characteristic.labels.length; i++) {
                var filteredValues = $filter('filter')(values, compareCharacteristicPredicate(characteristic, i));
                counts.push(filteredValues.length);
            }

            return counts;
        }

        self.getCharacteristicListCount = function (characteristicList, values) {
            var counts = [];
            characteristicList.map(c => {
                counts.push.apply(counts, self.getCharacteristicCount(c, values));
            });
            

            return counts;
        }

        self.getLabels = function (startDate, endDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.day:
                    return getDayLabels(startDate, endDate);
                    break;
                case self.temporalDetail.week:
                    return getWeekLabels(startDate, endDate);
                    break;
                case self.temporalDetail.month:
                    return getMonthLabels(startDate, endDate);
                    break;
            }                  
        }

        self.getFilters = function (startDate, endDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.day:
                    return getDayFilters(startDate, endDate);
                    break;
                case self.temporalDetail.week:
                    return getWeekFilters(startDate, endDate);
                    break;
                case self.temporalDetail.month:
                    return getMonthFilters(startDate, endDate);
                    break;
            }                
        }

        self.getNumberOfItems = function (startDate, endDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.day:
                    return getNumberOfDays(startDate, endDate);
                    break;
                case self.temporalDetail.week:
                    return getNumberOfWeeks(startDate, endDate);
                    break;
                case self.temporalDetail.month:
                    return getNumberOfMonths(startDate, endDate);
                    break;
            }            
        }

        return self;
    }
})();