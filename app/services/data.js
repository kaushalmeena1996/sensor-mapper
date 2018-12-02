var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, STATUS_CODES, MAP_CATEGORIES, SENSOR_STATUSES, SERVICE_EVENTS) {
    var dataService = {};

    var nodeData = {},
        nodeRef,
        nodeDataLoaded = false,
        valueData = {},
        valueRef,
        valueDataLoaded = false;

    function fetchNodeData() {
        nodeRef = firebase.database().ref().child('nodes');

        nodeRef.on("value", function (snapshot) {
            nodeData = snapshot.val();
            nodeDataLoaded = true;
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });

        nodeRef.on("child_changed", function (snapshot) {
            var item = snapshot.val();
            nodeData[item.id] = item;
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataUpdated, nodeItem: item });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });
    };

    function fetchValueData() {
        valueRef = firebase.database().ref().child('values');

        valueRef.once("value", function (snapshot) {
            valueData = snapshot.val();
            valueDataLoaded = true;
            $rootScope.$emit(SERVICE_EVENTS.valueDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });

        valueRef.on("child_changed", function (snapshot) {
            var item = snapshot.val();
            valueData[item.id] = item;
            $rootScope.$emit(SERVICE_EVENTS.valueDataChanged, { changeCode: STATUS_CODES.dataUpdated, valueItem: item });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });
    };

    dataService.subscribeNodeData = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (nodeDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        } else {
            fetchNodeData();
        }

        scope.$on('$destroy', handler);
    };

    dataService.subscribeValueData = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (valueDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.valueDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        } else {
            fetchValueData();
        }

        scope.$on('$destroy', handler);
    };

    dataService.getNodeDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            data.push(item);
        });

        return data;
    };

    dataService.getNodeDataAsObject = function () {
        return nodeData;
    };

    dataService.getValueDataAsArray = function () {
        var data = [];

        angular.forEach(valueData, function (item) {
            data.push(item);
        });

        return data;
    };

    dataService.getValueDataAsObject = function () {
        return valueData;
    };

    dataService.getNodeItem = function (id) {
        return nodeData[id];;
    };

    dataService.getValueItem = function (id) {
        return valueData[id];
    };

    dataService.getCentreDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.centre) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getLocationDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.location) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getSensorDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getNormalSensorDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.normal) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getNormalSensorCount = function () {
        var count = 0;

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.normal) {
                count++;
            }
        });

        return count;
    };


    dataService.getFailedSensorDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.failure) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getFailedSensorCount = function () {
        var count = 0;

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.failure) {
                count++;
            }
        });

        return count;
    };

    dataService.getAbnormalSensorDataAsArray = function () {
        var data = [];

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.abnormal) {
                data.push(item);
            }
        });

        return data;
    };

    dataService.getAbnormalSensorCount = function () {
        var count = 0;

        angular.forEach(nodeData, function (item) {
            if (item.category == MAP_CATEGORIES.sensor && item.status == SENSOR_STATUSES.abnormal) {
                count++;
            }
        });

        return count;
    };

    $rootScope.$on('$destroy', function () {
        nodeRef.off();
        valueRef.off();
    });

    return dataService;
});