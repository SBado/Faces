(function () {
    "use strict";

    angular.module("faces")
        .factory("UtilityService", UtilityService);

    function UtilityService() {

        var self = this;

        self.operators = {
            '==': function (a, b) { return a == b },
            '!=': function (a, b) { return a != b },
            '+': function (a, b) { return a + b },
            '-': function (a, b) { return a - b },
            '*': function (a, b) { return a * b },
            '/': function (a, b) { return a / b },
            '<': function (a, b) { return a < b },
            '<=': function (a, b) { return a <= b },
            '>': function (a, b) { return a > b },
            '>=': function (a, b) { return a >= b },
            '<,<': function (a, b, c) { return b < a && a < c },
            '<=,<': function (a, b, c) { return b <= a && a < c },
            '<,<=': function (a, b, c) { return b < a && a <= c },
            '<=,<=': function (a, b, c) { return b <= a && a <= c },
            '>,>': function (a, b, c) { return b > a && a > c },
            '>=,>': function (a, b, c) { return b >= a && a > c },
            '>,>=': function (a, b, c) { return b > a && a >= c },
            '>=,>=': function (a, b, c) { return b >= a && a >= c },
        };

        self.greaterThanPredicate = function (prop, val, equal) {
            if (equal) {
                return function (item) {
                    return item[prop] >= val;
                }
            }
            return function (item) {
                return item[prop] > val;
            }
        }

        self.lessThanPredicate = function (prop, val, equal) {
            if (equal) {
                return function (item) {
                    return item[prop] <= val;
                }
            }
            return function (item) {
                return item[prop] < val;
            }
        }

        self.betweenPredicate = function (prop, minVal, maxVal, minEqual, maxEqual) {
            if (minEqual && !maxEqual) {
                return function (item) {
                    return minVal <= item[prop] < maxVal;
                }
            }
            else if (!minEqual && maxEqual) {
                return function (item) {
                    return minVal < item[prop] <= maxVal;
                }
            }
            else if (minEqual && maxEqual) {
                return function (item) {
                    return minVal <= item[prop] <= maxVal;
                }
            }
            else {
                return function (item) {
                    return minVal < item[prop] < maxVal;
                }
            }
        }

        return self;
    }
})();