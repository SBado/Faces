(function () {
    "use strict";

    angular.module("faces")
        .factory("OdataService", ['$http', '$q', 'StoreTreeService', OdataService]);

    function OdataService($http, $q, StoreTreeService) {

        console.log('OdataService instantiated');

        var self = this;
        var baseUrl = "http://localhost:65233";

        function getAll(endpoint, options, count) {
            var _options = options ? '?' + options : '';
            var _count = count ? '/$count' : ''

            return $http.get(baseUrl + '/' + endpoint + _count + _options);


            //if (options) {
            //    return $http.get(baseUrl + '/' + endpoint + '?' + options);
            //}
            //return $http.get(baseUrl + '/' + endpoint);
        }

        function createEmptyResponse() {
            return $q.resolve({
                status: 200,
                data: { value: [] }
            });
        }

        self.getStoreTrees = function (options) {
            return getAll('StoreTrees', options);
        }

        //self.getAllFaces = function (options) {
        //    return getAll('Faces', options);
        //}

        self._getFaces = function (inDate, cameraList, outDate, dateEquality, filter, groupByList, aggregate, selectList) {
            if (outDate && outDate < inDate) {
                return createEmptyResponse();
            }

            var cameraFilter = '';
            cameraList.map(camera => cameraFilter += 'EntranceCamera eq ' + camera.ID + ' or ');
            if (!cameraFilter) {
                return createEmptyResponse();
            }
            cameraFilter = cameraFilter.slice(0, -4);
            cameraFilter = " and (" + cameraFilter + ")";

            var comparator = dateEquality ? ' eq ' : ' ge ';
            //var dateFilter = 'EntranceTimestamp' + comparator + inDate.toISOString(); ///// UTC
            var dateFilter = 'EntranceTimestamp' + comparator + new Date(inDate.getTime() - (inDate.getTimezoneOffset() * 60000)).toISOString();

            if (outDate) {
                comparator = dateEquality ? ' eq ' : ' le '
                //dateFilter += ' and ExitTimestamp' + comparator + outDate.toISOString(); ///// UTC
                dateFilter += ' and ExitTimestamp' + comparator + new Date(outDate.getTime() - (outDate.getTimezoneOffset() * 60000)).toISOString();
            }

            var select = '';
            if (selectList) {
                select = '&$select=' + selectList.join(',');
            }

            if (outDate) {
                if (groupByList && aggregate) {
                    return getAll('Faces','$apply=filter(' + dateFilter + ' ' + cameraFilter +
                        ')/groupby((' + groupByList.join(',') +
                        '),aggregate(' + aggregate.property +
                        ' with ' + aggregate.transformation +
                        ' as ' + aggregate.alias + '))');
                }
                return getAll('Faces','$filter=' + dateFilter + ' ' + cameraFilter + select);
            }
            else {
                if (groupByList && aggregate) {
                    return getAll('Faces','$apply=filter(ExitTimestamp eq null and ' + dateFilter + ' ' + cameraFilter +
                        ')/groupby((' + groupByList.join(',') +
                        '),aggregate(' + aggregate.property +
                        ' with ' + aggregate.transformation +
                        ' as ' + aggregate.alias + '))');
                }
                return getAll('Faces','$filter=ExitTimestamp eq null and ' + dateFilter + ' ' + cameraFilter + select);
            }

        }

        self.getFaces = function (dateTimeRangeList, cameraList, dateTimeEquality, filter, groupByList, aggregate, selectList, count) {
            var cameraFilter = '';
            cameraList.map(camera => {
                if (cameraFilter) {
                    cameraFilter += ' or ';
                }
                cameraFilter += '(EntranceCamera eq ' + camera.ID + ')'
            });
            if (!cameraFilter) {
                return createEmptyResponse();
            }
            
            var dateTimeFilter = '';
            dateTimeRangeList.map(range => {
                var firstDateTime = range.firstDateTime;
                var lastDateTime = range.lastDateTime;
                var dateTimeFunction = range.dateTimeFunction;
                if (lastDateTime && lastDateTime < firstDateTime) {
                    return;
                } 
                var firstParameter = 'EntranceTimestamp'
                var lastParameter = 'ExitTimestamp'
                if (dateTimeFunction) {
                    firstParameter = dateTimeFunction + '(' + firstParameter + ')';
                    lastParameter = dateTimeFunction + '(' + lastParameter + ')';
                }
                
                if (dateTimeFilter) {
                    dateTimeFilter += ' or ';
                }
                if (!lastDateTime) {
                    var comparator = dateTimeEquality[0] ? 'ge' : 'gt';
                    var value = Object.prototype.toString.call(firstDateTime) === "[object Date]" ? 
                        new Date(firstDateTime.getTime() - (firstDateTime.getTimezoneOffset() * 60000)).toISOString() :
                        firstDateTime
                    dateTimeFilter += '(' + firstParameter + ' ' + comparator + ' ' + value + ' and ExitTimestamp eq null)';                    
                }
                else {
                    var comparators = [];
                    comparators.push(dateTimeEquality[0] ? 'le' : 'lt');
                    comparators.push(dateTimeEquality[1] ? 'ge' : 'gt');
                    var firstValue = Object.prototype.toString.call(lastDateTime) === "[object Date]" ?
                        new Date(lastDateTime.getTime() - (lastDateTime.getTimezoneOffset() * 60000)).toISOString() :
                        lastDateTime
                    var lastValue = Object.prototype.toString.call(firstDateTime) === "[object Date]" ?
                        new Date(firstDateTime.getTime() - (firstDateTime.getTimezoneOffset() * 60000)).toISOString() :
                        firstDateTime
                    dateTimeFilter += '(' + firstParameter + ' ' + comparators[0] + ' ' + firstValue;
                    dateTimeFilter += ' and ' + lastParameter + ' ' + comparators[1] + ' ' + lastValue + ')';

                }
            });

            var select = '';
            if (selectList) {
                select = '&$select=' + selectList.join(',');
            }


            if (groupByList && aggregate) {
                return getAll('Faces','$apply=filter((' + dateTimeFilter + ') and (' + cameraFilter +
                    '))/groupby((' + groupByList.join(',') +
                    '),aggregate(' + aggregate.property +
                    ' with ' + aggregate.transformation +
                    ' as ' + aggregate.alias + '))', count);
            }
            return getAll('Faces','$filter=(' + dateTimeFilter + ') and (' + cameraFilter + ')' + select, count);
        }

        self.getFacesInStore = function (cameraList) {
            var today = new Date();
            return self.getFaces([{
                firstDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }], cameraList, [true]);
        }        

        self.getBaskets = function (options) {
            return getAll('Baskets', options);
        }

        self.getBasketsCount = function (options) {
            return getAll('Baskets', options, true);
        }

        self.getBasketsInStore = function (zones) {
            var zoneFilter = '';
            zones.map(function (zone) {
                zoneFilter += 'CurrentZone eq ' + zone.ID + ' or '
            });

            if (zoneFilter) {
                zoneFilter = zoneFilter.slice(0, -4);
                return self.getBaskets('$filter=' + zoneFilter);
            }
            else {
                return createEmptyResponse();
            }
        }

        self.getBasketsInStoreCount = function (zones) {
            var zoneFilter = '';
            zones.map(function (zone) {
                zoneFilter += 'CurrentZone eq ' + zone.ID + ' or '
            });

            if (zoneFilter) {
                zoneFilter = zoneFilter.slice(0, -4);
                return self.getBasketsCount('$filter=' + zoneFilter);
            }
            else {
                return createEmptyResponse();
            }
        }

        self.getCamerasFacesCount = function (cameraList, date) {
            var cameraFilter = '';
            cameraList.map(camera => cameraFilter += 'ID eq ' + camera.ID + ' or ');
            if (cameraFilter) {
                cameraFilter = cameraFilter.slice(0, -4);
                cameraFilter = " and (" + cameraFilter + ")";

                var entranceDateFilter = '';
                var exitDateFilter = '';
                if (date) {
                    entranceDateFilter = '$filter=year(EntranceTimestamp) eq ' + date.getFullYear() +
                        ' and month(EntranceTimestamp) eq ' + (date.getMonth() + 1) +
                        ' and day(EntranceTimestamp) eq ' + date.getDate() + ';';

                    exitDateFilter = '$filter=year(ExitTimestamp) eq ' + date.getFullYear() +
                        ' and month(ExitTimestamp) eq ' + (date.getMonth() + 1) +
                        ' and day(ExitTimestamp) eq ' + date.getDate() + ';';
                }

                //return $http.get("http://localhost:65233/StoreTrees?$filter=IsCamera eq true" + cameraFilter + "&$expand=FacesIn(" + entranceDateFilter + "$count=true;$top=0),FacesOut(" + exitDateFilter + "$count=true;$top=0)")
                var options = "$filter=IsCamera eq true" + cameraFilter + "&$expand=FacesIn(" + entranceDateFilter + "$count=true;$top=0),FacesOut(" + exitDateFilter + "$count=true;$top=0)";
                return getAll('StoreTrees', options);
            }
            else {
                return createEmptyResponse();
            }
        }

        return self;
    }
})();