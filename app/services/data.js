var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, $filter, MAP_CATEGORIES, SERVICE_EVENTS) {
    var dataService = {};

    var nodeData = [],
        nodeRef,
        nodeDataLoaded = false;

    dataService.fetchNodeData = function () {
        nodeRef = firebase.database().ref().child('nodes');

        nodeRef.on("value", function (snapshot) {
            nodeData = [];

            angular.forEach(snapshot.val(), function (item) {
                nodeData.push(item);
            });

            nodeDataLoaded = true;

            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged);
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });
    };

    dataService.subscribe = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (nodeDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged);
        } else {
            dataService.fetchNodeData();
        }

        scope.$on('$destroy', handler);
    };

    dataService.isNodeDataLoaded = function () {
        return nodeDataLoaded;
    };

    dataService.getNodeData = function () {
        return nodeData;
    };

    dataService.getCentreData = function () {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.centre
        }, true);

        return data;
    };

    dataService.getCentreDetail = function (id) {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.centre,
            'id': id
        }, true);

        return data[0];
    };

    dataService.getLocationData = function () {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.location
        }, true);

        return data;
    };

    dataService.getLocationDetail = function (id) {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.location,
            'id': id
        }, true);

        return data[0];
    };

    dataService.getSensorData = function () {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.sensor
        }, true);

        return data;
    };

    dataService.getSensorDetail = function (id) {
        var data = $filter('filter')(nodeData, {
            'category': MAP_CATEGORIES.sensor,
            'id': id
        }, true);

        return data[0];
    };

    $rootScope.$on('$destroy', function () {
        nodeRef.off();
    });

    return dataService;
});