(function () {
    "use strict";

    angular.module("faces")
        .factory("OdataService", ['$http', '$q', 'StoreTreeService', OdataService]);

    function OdataService($http, $q, StoreTreeService) {

        console.log('OdataService instantiated');

        var self = this;
        var baseUrl = "http://localhost:65233";

        function getAll(endpoint, options) {
            if (options) {
                return $http.get(baseUrl + '/' + endpoint + '?' + options);
            }
            return $http.get(baseUrl + '/' + endpoint);
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

        self.getAllFaces = function (options) {
            return getAll('Faces', options);
        }

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
                    return self.getAllFaces('$apply=filter(' + dateFilter + ' ' + cameraFilter +
                        ')/groupby((' + groupByList.join(',') +
                        '),aggregate(' + aggregate.property +
                        ' with ' + aggregate.transformation +
                        ' as ' + aggregate.alias + '))');
                }
                return self.getAllFaces('$filter=' + dateFilter + ' ' + cameraFilter + select);
            }
            else {
                if (groupByList && aggregate) {
                    return self.getAllFaces('$apply=filter(ExitTimestamp eq null and ' + dateFilter + ' ' + cameraFilter +
                        ')/groupby((' + groupByList.join(',') +
                        '),aggregate(' + aggregate.property +
                        ' with ' + aggregate.transformation +
                        ' as ' + aggregate.alias + '))');
                }
                return self.getAllFaces('$filter=ExitTimestamp eq null and ' + dateFilter + ' ' + cameraFilter + select);
            }

        }

        self.getFaces = function (dateRangeList, cameraList, filter, groupByList, aggregate, selectList) {
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
            
            var dateFilter = '';
            dateRangeList.map(range => {
                var firstDate = range.firstDate;
                var lastDate = range.lastDate;
                if (lastDate && lastDate < firstDate) {
                    return;
                }
                if (dateFilter) {
                    dateFilter += ' or ';
                }
                if (!lastDate) {
                    dateFilter += '(EntranceTimestamp ge ' + new Date(firstDate.getTime() - (firstDate.getTimezoneOffset() * 60000)).toISOString() + ' and ExitTimestamp eq null)';                    
                }
                else {
                    dateFilter += '(EntranceTimestamp le ' + new Date(lastDate.getTime() - (lastDate.getTimezoneOffset() * 60000)).toISOString();
                    dateFilter += ' and ExitTimestamp ge ' + new Date(firstDate.getTime() - (firstDate.getTimezoneOffset() * 60000)).toISOString() + ')';

                }
            });

            var select = '';
            if (selectList) {
                select = '&$select=' + selectList.join(',');
            }


            if (groupByList && aggregate) {
                return self.getAllFaces('$apply=filter((' + dateFilter + ') and (' + cameraFilter +
                    '))/groupby((' + groupByList.join(',') +
                    '),aggregate(' + aggregate.property +
                    ' with ' + aggregate.transformation +
                    ' as ' + aggregate.alias + '))');
            }
            return self.getAllFaces('$filter=(' + dateFilter + ') and (' + cameraFilter + ')' + select);
        }

        self.getFacesInStore = function (dateRangeList, cameraList) {
            return self.getFaces(dateRangeList, cameraList);
        }

        self.getBaskets = function (options) {
            return getAll('Baskets', options);
        }

        self.getBasketsCount = function (options) {
            return getAll('Baskets/$count', options);
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