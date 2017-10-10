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


        function isTodayIncluded(firstDateTime, lastDateTime) {
            var todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            var todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            return lastDateTime.getTime() >= todayStart.getTime() && firstDateTime.getTime() <= todayEnd.getTime();
        }

        function addDateTimeRangeToFilter(dateTimeFilter, firstDateTime, lastDateTime, dateTimeFunction) {
            dateTimeFilter.dateTimeRangeList.push({
                firstDateTime: firstDateTime,
                lastDateTime: lastDateTime,
                dateTimeFunction: dateTimeFunction
            });
        }

        function addInStoreFilter(dateTimeFilter) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);            
            addDateTimeRangeToFilter(dateTimeFilter, today, null);
        }


        function getNumberOfMonths(firstDateTime, lastDateTime) {
            var startMonth = firstDateTime.getMonth();
            var startYear = firstDateTime.getFullYear();
            var endMonth = lastDateTime.getMonth();
            var endYear = lastDateTime.getFullYear();

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

        function loopMonths (firstDateTime, numberOfMonths, fn, param) {            
            var loopNumber = 0;
            var year = firstDateTime.getFullYear();
            var lastSelectedMonth = firstDateTime.getMonth();                     
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

        function createMonthFilter(filterList, firstDateTime, index) {
            var lastDateTime = angular.copy(firstDateTime);
            lastDateTime.setDate(daysInMonth[lastDateTime.getMonth()]);
            lastDateTime.setHours(23, 59, 59, 999);
            var filter = {
                index: index,
                dateTimeRangeList: [
                    {
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime,
                    }
                ],
                dateTimeEquality: [true, true]
            }            
            if (isTodayIncluded(firstDateTime, lastDateTime)) {
                addInStoreFilter(filter);
            }
            filterList.push(filter);
        }

        function getMonthLabels(firstDateTime, lastDateTime) {
            var labelList = [];
            loopMonths(firstDateTime, getNumberOfMonths(firstDateTime, lastDateTime), createMonthLabel, labelList);
            return labelList;
        }

        function getMonthFilters(firstDateTime, lastDateTime) {
            var dateFilters = [];
            loopMonths(firstDateTime, getNumberOfMonths(firstDateTime, lastDateTime), createMonthFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfWeeks(firstDateTime, lastDateTime) {
            var startWeek = getWeekNumber(firstDateTime);
            var startYear = firstDateTime.getFullYear();
            var endWeek = getWeekNumber(lastDateTime);
            var endYear = lastDateTime.getFullYear();

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

        function loopWeeks(firstDateTime, numberOfWeeks, fn, param) {
            var loopNumber = 0;
            var year = firstDateTime.getFullYear();
            var weeksForYear = weeksInYear(year);
            var lastSelectedWeek = getWeekNumber(firstDateTime);
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
            var lastDateTime = angular.copy(date);
            lastDateTime.setDate(lastDateTime.getDate() + 6);

            var firstMonth = date.getMonth();
            var lastMonth = lastDateTime.getMonth();
            monthLabel = months[firstMonth]
            if (firstMonth != lastMonth) {
                monthLabel += '/' + months[lastMonth];
            }

            var firstYear = date.getFullYear();
            var lastYear = lastDateTime.getFullYear();
            yearLabel = firstYear
            if (firstYear != lastYear) {
                yearLabel += '/' + lastYear;
            }

            //labelList.push(monthLabel + ' ' + yearLabel + '-' + getWeekNumber(date));
            labelList.push(yearLabel + '-' + getWeekNumber(date));
        }

        function createWeekFilter(filterList, firstDateTime, index) {
            var lastDateTime = angular.copy(firstDateTime);
            lastDateTime.setDate(lastDateTime.getDate() + 6);
            //if (monthList.length == 1) {
            //    monthList.push(monthList[0]);
            //}
            lastDateTime.setHours(23, 59, 59, 999);
            var filter = {
                index: index,
                dateTimeRangeList: [
                    {
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime,
                    }
                ],
                dateTimeEquality: [true, true]
            };
            if (isTodayIncluded(firstDateTime, lastDateTime)) {
                addInStoreFilter(filter);
            }
            filterList.push(filter);
        }

        function getWeekLabels(firstDateTime, lastDateTime) {
            var labelList = [];
            loopWeeks(firstDateTime, getNumberOfWeeks(firstDateTime, lastDateTime), createWeekLabel, labelList);
            return labelList;
        }

        function getWeekFilters(firstDateTime, lastDateTime) {
            var dateFilters = [];
            loopWeeks(firstDateTime, getNumberOfWeeks(firstDateTime, lastDateTime), createWeekFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfDays(firstDateTime, lastDateTime) {
            return Math.round((lastDateTime - firstDateTime) / (1000 * 60 * 60 * 24)) + 1;
        }

        function loopDays(firstDateTime, numberOfDays, fn, param) {
            var loopNumber = 0;
            var year = firstDateTime.getFullYear();
            var month = firstDateTime.getMonth();
            var lastSelectedMonth = month;
            var lastSelectedDay = firstDateTime.getDate();
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

        function createDayFilter(filterList, firstDateTime, index) {
            var lastDateTime = angular.copy(firstDateTime);
            lastDateTime.setHours(23, 59, 59, 999);
            var filter = {
                index: index,
                dateTimeRangeList: [
                    {
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime,
                    }
                ],
                dateTimeEquality: [true, true]
            }
            if (isTodayIncluded(firstDateTime, lastDateTime)) {
                addInStoreFilter(filter);
            }
            filterList.push(filter);
        }

        function getDayLabels(firstDateTime, lastDateTime) {
            var labelList = [];
            loopDays(firstDateTime, getNumberOfDays(firstDateTime, lastDateTime), createDayLabel, labelList);
            return labelList;
        }

        function getDayFilters(firstDateTime, lastDateTime) {
            var dateFilters = [];
            loopDays(firstDateTime, getNumberOfDays(firstDateTime, lastDateTime), createDayFilter, dateFilters);
            return dateFilters;
        }

        function getTodayFilter() {
            var dateFilters = [];
            var today = new Date();
            var firstDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            createDayFilter(dateFilters, firstDateTime, 0);
            addInStoreFilter(dateFilters[0]);

            return dateFilters;
        }



        function getNumberOfHours(firstDateTime, lastDateTime) {
            return 24 + Math.floor(Math.abs(lastDateTime - firstDateTime) / 3.6e6);
        }

        function loopHours(firstDateTime, numberOfHours, fn, param) {
            var loopNumber = 0;
            var year = firstDateTime.getFullYear();
            var month = firstDateTime.getMonth();
            var day = firstDateTime.getDate();
            var lastSelectedMonth = month;
            var lastSelectedDay = firstDateTime.getDate();
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

        function createHourFilter(filterList, firstDateTime, index) {
            var lastDateTime = angular.copy(firstDateTime);
            lastDateTime.setMinutes(59, 59, 999);
            var filter = {
                index: index,
                dateTimeRangeList: [
                    {
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime,
                    }
                ],
                dateTimeEquality: [true, true]
            };
            //if (isTodayIncluded(firstDateTime, lastDateTime)) {
            //    addInStoreFilter(filter);
            //}
            filterList.push(filter);
        }

        function getHourLabels(firstDateTime, lastDateTime) {
            var labelList = [];
            loopHours(firstDateTime, getNumberOfHours(firstDateTime, lastDateTime), createHourLabel, labelList);
            return labelList;
        }

        function getHourFilters(firstDateTime, lastDateTime) {
            var dateFilters = [];
            loopHours(firstDateTime, getNumberOfHours(firstDateTime, lastDateTime), createHourFilter, dateFilters);
            return dateFilters;
        }



        function getNumberOfDaysOfWeek() {
            return 7;
        }

        function getDatesForDaysOfWeek(firstDateTime, numberOfDays) {
            var days = new Array();
            for (var i = 0; i < 7; i++) {
                days.push(new Array());
            }

            loopDays(firstDateTime, numberOfDays, function (days, date, index) {
                var dayOfWeek = date.getDay();
                days[dayOfWeek].push(date);
            }, days);

            return days;
        }

        function getDaysOfWeekLabels() {
            return ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        }

        function getDaysOfWeekFilters(firstDateTime, lastDateTime) {
            var numberOfDays = getNumberOfDays(firstDateTime, lastDateTime);
            var dateMatrix = getDatesForDaysOfWeek(firstDateTime, numberOfDays);
            var filterList = [];
            var index = 6;

            dateMatrix.map(dateList => {
                var filter = {
                    index: index,
                    dateTimeRangeList: [],
                    dateTimeEquality: [true, true]
                };

                dateList.map(firstDateTime => {
                    var lastDateTime = angular.copy(firstDateTime);
                    lastDateTime.setHours(23, 59, 59, 999);

                    filter.dateTimeRangeList.push({
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime
                    });
                });
                if (isTodayIncluded(firstDateTime, lastDateTime)) {
                    addInStoreFilter(filter);
                }
                filterList.push(filter);
                index = (index + 1) % 7;
            });

            filterList.push(filterList.shift()); //Altrimenti partiamo da Domenica
            return filterList;
        }



        function getNumberOfHoursOfDay() {
            return 24;
        }

        function getDatesForHoursOfDay(firstDateTime, numberOfHours) {
            var hours = new Array();
            for (var i = 0; i < 24; i++) {
                hours.push(new Array());
            }

            loopHours(firstDateTime, numberOfHours, function (hours, date, index) {
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

        function _getHoursOfDayFilters(firstDateTime, lastDateTime) {
            var numberOfHours = getNumberOfHours(firstDateTime, lastDateTime);
            var dateMatrix = getDatesForHoursOfDay(firstDateTime, numberOfHours);
            var filterList = [];
            var index = 0;

            dateMatrix.map(dateList => {
                var filter = {
                    index: index,
                    dateTimeRangeList: []
                };

                dateList.map(firstDateTime => {
                    var lastDateTime = angular.copy(firstDateTime);
                    lastDateTime.setMinutes(59, 59, 999);

                    filter.dateTimeRangeList.push({
                        firstDateTime: firstDateTime,
                        lastDateTime: lastDateTime
                    });
                });

                filterList.push(filter);
                index++;
            });

            return filterList;
        }

        function getHoursOfDayFilters(firstDateTime, lastDateTime) {
            var filterList = [];
            for (var index = 0; index < 24; index++) {
                var filter = {
                    index: index,                    
                    dateTimeRangeList: [],                    
                    dateTimeEquality: [true, false]
                };

                filter.dateTimeRangeList.push({
                    firstDateTime: index,
                    lastDateTime: index + 1,
                    dateTimeFunction: 'hour'
                });
                //if (isTodayIncluded(firstDateTime, lastDateTime)) {
                //    addInStoreFilter(filter);
                //}
                filterList.push(filter);
            }                     

            return filterList;
        }

        function getHoursOfTodayFilter() {

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

        self.getLabels = function (firstDateTime, lastDateTime, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getMonthLabels(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.week:
                    return getWeekLabels(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.day:
                    return getDayLabels(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.hour:
                    return getHourLabels(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getDaysOfWeekLabels();
                    break;
                case self.temporalDetail.hourOfDay:
                    return getHoursOfDayLabels();
                    break;
            }                  
        }

        self.getFilters = function (firstDateTime, lastDateTime, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getMonthFilters(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.week:
                    return getWeekFilters(firstDateTime, lastDateTime);
                    break; 
                case self.temporalDetail.day:
                    return getDayFilters(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.hour:
                    return getHourFilters(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getDaysOfWeekFilters(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.hourOfDay:
                    return getHoursOfDayFilters(firstDateTime, lastDateTime);
                    break;
            }
        }

        self.getNumberOfItems = function (firstDateTime, lastDateTime, temporalDetail) {
            switch (temporalDetail) {
                case self.temporalDetail.month:
                    return getNumberOfMonths(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.week:
                    return getNumberOfWeeks(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.day:
                    return getNumberOfDays(firstDateTime, lastDateTime);
                    break;                
                case self.temporalDetail.hour:
                    return getNumberOfHours(firstDateTime, lastDateTime);
                    break;
                case self.temporalDetail.dayOfWeek:
                    return getNumberOfDaysOfWeek();
                    break;
                case self.temporalDetail.hourOfDay:
                    return getNumberOfHoursOfDay();
                    break;
            }            
        }        

        self.getTodayFilter = getTodayFilter;

        return self;
    }
})();