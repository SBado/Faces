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

        return self;
    }
})();