(function () {
    "use strict";

    angular.module("faces")
        .factory("StoreTreeService", function (rx) {
            var subject = new rx.Subject();
            var context = null;
            var api = null;

            console.log('StoreTreeService instantiated');

            return {
                setContext: function setContext(c) {
                    context = c;
                    subject.onNext(c);
                },
                getContext: function getContext() {
                    return context;
                },
                setApi: function setApi(a) {
                    api = a;
                },
                getApi: function getApi() {
                    return api;
                },
                subscribe: function (o) {
                    return subject.subscribe(o);
                }
            };

            //var self = this;

            //self.context = {};                
            //self.storeTreeApi = null;

            //return self;
        });
})();