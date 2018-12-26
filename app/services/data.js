var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, MAP_CATEGORIES, MAP_CENTRES, MAP_LOCATIONS, MAP_SENSORS, SENSOR_STATUSES, STATUS_CODES, SERVICE_EVENTS) {
    var dataService = {};

    var nodeData = {},
        nodeRef,
        nodeDataLoaded = false;

    function fetchNodeData() {
        nodeRef = firebase.database().ref().child('nodes');

        nodeRef.once("value", function (snapshot) {
            nodeData = snapshot.val();
            updateNodeData();
            nodeDataLoaded = true;
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });

        nodeRef.on("child_changed", function (snapshot) {
            var item = snapshot.val();
            nodeData[item.id] = item;
            updateSensorItem(item);
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataUpdated, nodeItem: nodeData[item.id] });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');
        });
    }

    function updateNodeData() {
        angular.forEach(nodeData, function (item) {
            switch (item.category) {
                case MAP_CATEGORIES.centre:
                    nodeData[item.id].icon = MAP_CENTRES[item.typeId].icon;
                    break;
                case MAP_CATEGORIES.location:
                    nodeData[item.id].icon = MAP_LOCATIONS[item.typeId].icon;
                    break;
                case MAP_CATEGORIES.sensor:
                    if (item.value > item.upperLimit) {
                        nodeData[item.id].status = SENSOR_STATUSES.abnormal;
                        nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.abnormal;
                    } else if (item.value > item.lowerLimit) {
                        nodeData[item.id].status = SENSOR_STATUSES.normal;
                        nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.normal;
                    } else {
                        nodeData[item.id].status = SENSOR_STATUSES.failure;
                        nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.failure;
                    }
                    break;
            }
        });
    }

    function updateSensorItem(item) {
        if (item.category == MAP_CATEGORIES.sensor) {
            if (item.value > item.upperLimit) {
                nodeData[item.id].status = SENSOR_STATUSES.abnormal;
                nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.abnormal;
            } else if (item.value > item.lowerLimit) {
                nodeData[item.id].status = SENSOR_STATUSES.normal;
                nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.normal;
            } else {
                nodeData[item.id].status = SENSOR_STATUSES.failure;
                nodeData[item.id].icon = MAP_SENSORS[item.typeId].icon.failure;
            }
        }
    }

    dataService.subscribeNodeData = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (nodeDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.nodeDataChanged, { changeCode: STATUS_CODES.dataLoaded });
        } else {
            fetchNodeData();
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

    dataService.getNodeItem = function (id) {
        return nodeData[id];
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
    });

    return dataService;
});