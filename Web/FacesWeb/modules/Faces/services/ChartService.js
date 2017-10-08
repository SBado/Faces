(function () {
    "use strict";

    angular.module("faces")
        .factory("ChartService", ['$filter', 'moment', 'UtilityService', ChartService]);

    function ChartService($filter, moment, UtilityService) {

        var self = this;

        var daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        var months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]       

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
        


        function getNumberOfMonths(firstDate, lastDate) {
            var startMonth = firstDate.getMonth();
            var startYear = firstDate.getFullYear();
            var endMonth = lastDate.getMonth();
            var endYear = lastDate.getFullYear();

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

        function loopMonths (firstDate, numberOfMonths, fn, param) {            
            var loopNumber = 0;
            var year = firstDate.getFullYear();
            var lastSelectedMonth = firstDate.getMonth();                     
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
            lastDate.setDate(daysInMonth[lastDate.getMonth()]);
            lastDate.setHours(23, 59, 59, 999);
            filterList.push({
                index: index,
                dateRangeList: [
                    {
                        firstDate: firstDate,
                        lastDate: lastDate,
                    }
                ]
                //year: year,
                //months: [month, month],
                //firstDay: 1,
                //lastDay: daysInMonth[month],
                //firstHour: 0,
                //firstMinute: 0,
                //lastHour: 23,
                //lastMinute: 59
            })
        }

        function getMonthLabels(firstDate, lastDate) {
            var labelList = [];
            loopMonths(firstDate, getNumberOfMonths(firstDate, lastDate), createMonthLabel, labelList);
            return labelList;
        }

        function getMonthFilters(firstDate, lastDate) {
            var dateFilters = [];
            loopMonths(firstDate, getNumberOfMonths(firstDate, lastDate), createMonthFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfWeeks(firstDate, lastDate) {
            var startWeek = getWeekNumber(firstDate);
            var startYear = firstDate.getFullYear();
            var endWeek = getWeekNumber(lastDate);
            var endYear = lastDate.getFullYear();

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

        function loopWeeks(firstDate, numberOfWeeks, fn, param) {
            var loopNumber = 0;
            var year = firstDate.getFullYear();
            var weeksForYear = weeksInYear(year);
            var lastSelectedWeek = getWeekNumber(firstDate);
            for (var week = lastSelectedWeek; week <= weeksForYear; week = ((week + 1) % (weeksForYear + 1))) {
                if (week == 0) {
                    week = 1;
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
            var lastDate = angular.copy(date);
            lastDate.setDate(lastDate.getDate() + 6);

            var firstMonth = date.getMonth();
            var lastMonth = lastDate.getMonth();
            monthLabel = months[firstMonth]
            if (firstMonth != lastMonth) {
                monthLabel += '/' + months[lastMonth];
            }

            var firstYear = date.getFullYear();
            var lastYear = lastDate.getFullYear();
            yearLabel = firstYear
            if (firstYear != lastYear) {
                yearLabel += '/' + lastYear;
            }

            //labelList.push(monthLabel + ' ' + yearLabel + '-' + getWeekNumber(date));
            labelList.push(yearLabel + '-' + getWeekNumber(date));
        }

        function createWeekFilter(filterList, firstDate, index) {
            var lastDate = angular.copy(firstDate);
            lastDate.setDate(lastDate.getDate() + 6);
            //if (monthList.length == 1) {
            //    monthList.push(monthList[0]);
            //}
            lastDate.setHours(23, 59, 59, 999);

            filterList.push({
                index: index,
                dateRangeList: [
                    {
                        firstDate: firstDate,
                        lastDate: lastDate,
                    }
                ]
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

        function getWeekLabels(firstDate, lastDate) {
            var labelList = [];
            loopWeeks(firstDate, getNumberOfWeeks(firstDate, lastDate), createWeekLabel, labelList);
            return labelList;
        }

        function getWeekFilters(firstDate, lastDate) {
            var dateFilters = [];
            loopWeeks(firstDate, getNumberOfWeeks(firstDate, lastDate), createWeekFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfDays(firstDate, lastDate) {
            return Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        }

        function loopDays(firstDate, numberOfDays, fn, param) {
            var loopNumber = 0;
            var year = firstDate.getFullYear();
            var month = firstDate.getMonth();
            var lastSelectedMonth = month;
            var lastSelectedDay = firstDate.getDate();
            for (var day = lastSelectedDay; day <= daysInMonth[month]; day = (day + 1) % (daysInMonth[month] + 1)) {
                if (!day) {
                    day = 1;
                }
                if (lastSelectedDay > day) {
                    month = (month + 1) % 12;

                    if (lastSelectedMonth > month) {
                        year++;
                    }
                }

                fn(param, new Date(year, month, day, 0, 0, 0), loopNumber);

                loopNumber++;
                if (loopNumber == numberOfDays) {
                    break;
                }

                lastSelectedMonth = month;
                lastSelectedDay = day;
            }
        }

        function createDayLabel(labelList, date) {
            labelList.push(daysOfWeek[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
        }

        function createDayFilter(filterList, firstDate, index) {
            var lastDate = angular.copy(firstDate);
            lastDate.setHours(23, 59, 59, 999);
            filterList.push({
                index: index,
                dateRangeList: [
                    {
                        firstDate: firstDate,
                        lastDate: lastDate,
                    }
                ]
            })
        }

        function getDayLabels(firstDate, lastDate) {
            var labelList = [];
            loopDays(firstDate, getNumberOfDays(firstDate, lastDate), createDayLabel, labelList);
            return labelList;
        }

        function getDayFilters(firstDate, lastDate) {
            var dateFilters = [];
            loopDays(firstDate, getNumberOfDays(firstDate, lastDate), createDayFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfDaysOfWeek() {
            return 7;
        }

        function getDatesForDaysOfWeek(firstDate, numberOfDays) {
            var days = new Array();
            for (var i = 0; i < 7; i++) {
                days.push(new Array());
            }

            loopDays(firstDate, numberOfDays, function (days, date, index) {
                var dayOfWeek = date.getDay();
                days[dayOfWeek].push(date);
            }, days);

            return days;
        }

        function getDaysOfWeekLabels() {
            return ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        }

        function getDaysOfWeekFilters(firstDate, lastDate) {
            var numberOfDays = getNumberOfDays(firstDate, lastDate);
            var dateMatrix = getDatesForDaysOfWeek(firstDate, numberOfDays);
            var filterList = [];
            var index = 6;

            dateMatrix.map(dateList => {
                var filter = {
                    index: index,
                    dateRangeList: []
                };

                dateList.map(firstDate => {
                    var lastDate = angular.copy(firstDate);
                    lastDate.setHours(23, 59, 59, 999);

                    filter.dateRangeList.push({
                        firstDate: firstDate,
                        lastDate: lastDate
                    });
                });

                filterList.push(filter);
                index = (index + 1) % 7;
            });

            filterList.push(filterList.shift()); //Altrimenti partiamo da Domenica
            return filterList;
        }



        function getNumberOfHoursOfDay() {
            return 24;
        }

        function getDatesForHoursOfDay(firstDate, numberOfHours) {
            var hours = new Array();
            for (var i = 0; i < 24; i++) {
                hours.push(new Array());
            }

            loopHours(firstDate, numberOfHours, function (hours, date, index) {
                var hourOfDay = date.getHours();
                hours[hourOfDay].push(date);
            }, hours);

            return hours;
        }

        function getHoursOfDayLabels() {
            return ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9',
                '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17',
                '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'];
        }

        function getHoursOfDayFilters(firstDate, lastDate) {
            var numberOfHours = getNumberOfHours(firstDate, lastDate);
            var dateMatrix = getDatesForHoursOfDay(firstDate, numberOfHours);
            var filterList = [];
            var index = 0;

            dateMatrix.map(dateList => {
                var filter = {
                    index: index,
                    dateRangeList: []
                };

                dateList.map(firstDate => {
                    var lastDate = angular.copy(firstDate);
                    lastDate.setMinutes(59, 59, 999);

                    filter.dateRangeList.push({
                        firstDate: firstDate,
                        lastDate: lastDate
                    });
                });

                filterList.push(filter);
                index++;
            });

            return filterList;
        }



        function getNumberOfHours(firstDate, lastDate) {
            return 24 + Math.floor(Math.abs(lastDate - firstDate) / 3.6e6);
        }

        function loopHours(firstDate, numberOfHours, fn, param) {
            var loopNumber = 0;
            var year = firstDate.getFullYear();
            var month = firstDate.getMonth();
            var day = firstDate.getDate();
            var lastSelectedMonth = month;
            var lastSelectedDay = firstDate.getDate();
            var lastSelectedHour = 0;
            for (var hour = lastSelectedHour; hour <= 23; hour = (hour + 1) % (24)) {
                if (lastSelectedHour > hour) {
                    day = (day + 1) % (daysInMonth[month] + 1);
                    if (lastSelectedDay > day) {
                        month++;
                        if (lastSelectedMonth > month) {
                            year++;
                        }
                    }
                }

                fn(param, new Date(year, month, day, hour, 0, 0), loopNumber);

                loopNumber++;
                if (loopNumber == numberOfHours) {
                    break;
                }

                lastSelectedMonth = month;
                lastSelectedDay = day;
                lastSelectedHour = hour;
            }
        }

        function createHourLabel(labelList, date) {
            labelList.push(daysOfWeek[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + date.getHours() + ':00');
        }

        function createHourFilter(filterList, firstDate, index) {
            var lastDate = angular.copy(firstDate);
            lastDate.setMinutes(59, 59, 999);
            filterList.push({
                index: index,
                dateRangeList: [
                    {
                        firstDate: firstDate,
                        lastDate: lastDate,
                    }
                ]
            })
        }

        function getHourLabels(firstDate, lastDate) {
            var labelList = [];
            loopHours(firstDate, getNumberOfHours(firstDate, lastDate), createHourLabel, labelList);
            return labelList;
        }

        function getHourFilters(firstDate, lastDate) {
            var dateFilters = [];
            loopHours(firstDate, getNumberOfHours(firstDate, lastDate), createHourFilter, dateFilters);
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

        self.months = months;

        self.daysInMonth = daysInMonth;

        self.temporalDetail = {
            month: 'm',
            week: 'w',
            day: 'd',
            hour: 'h',
            dayOfWeek: 'dw',
            hourOfDay: 'hd'
        }

        self.characteristicType = {
            single: 's',
            multiple: 'm'
        }        

        self.getWeekNumber = getWeekNumber;
                                                  
        self.getCharacteristicGroupsCount = function (characteristic, values) {
            var counts = [];
            for (var i = 0; i < characteristic.labels.length; i++) {
                var items = $filter('filter')(values, compareCharacteristicPredicate(characteristic, i));
                if (items.length) {
                    counts.push(items[0].total);
                }
                else {
                    counts.push[0];
                }
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

        self.getLabels = function (firstDate, lastDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getMonthLabels(firstDate, lastDate);
                    break;
                case self.temporalDetail.week:
                    return getWeekLabels(firstDate, lastDate);
                    break;
                case self.temporalDetail.day:
                    return getDayLabels(firstDate, lastDate);
                    break;
                case self.temporalDetail.hour:
                    return getHourLabels(firstDate, lastDate);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getDaysOfWeekLabels();
                    break;
                case self.temporalDetail.hourOfDay:
                    return getHoursOfDayLabels();
                    break;
            }                  
        }

        self.getFilters = function (firstDate, lastDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getMonthFilters(firstDate, lastDate);
                    break;
                case self.temporalDetail.week:
                    return getWeekFilters(firstDate, lastDate);
                    break; 
                case self.temporalDetail.day:
                    return getDayFilters(firstDate, lastDate);
                    break;
                case self.temporalDetail.hour:
                    return getHourFilters(firstDate, lastDate);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getDaysOfWeekFilters(firstDate, lastDate);
                    break;
                case self.temporalDetail.hourOfDay:
                    return getHoursOfDayFilters(firstDate, lastDate);
                    break;
            }
        }

        self.getNumberOfItems = function (firstDate, lastDate, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getNumberOfMonths(firstDate, lastDate);
                    break;
                case self.temporalDetail.week:
                    return getNumberOfWeeks(firstDate, lastDate);
                    break;
                case self.temporalDetail.day:
                    return getNumberOfDays(firstDate, lastDate);
                    break;                
                case self.temporalDetail.hour:
                    return getNumberOfHours(firstDate, lastDate);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getNumberOfDaysOfWeek();
                    break;
                case self.temporalDetail.hourOfDay:
                    return getNumberOfHoursOfDay();
                    break;
            }            
        }

        return self;
    }
})();