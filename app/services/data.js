var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, MAP_CATEGORIES, MAP_CENTRES, CENTRE_STATUSES, MAP_LOCATIONS, LOCATION_STATUSES, MAP_SENSORS, SENSOR_STATUSES, STATUS_CODES, SERVICE_EVENTS) {
    var dataService = {};

    var nodeData = [],
        nodeRef,
        nodeDataLoaded = false,
        valueRef;

    function fetchNodeData() {
        nodeRef = firebase.database().ref().child('nodes');

        nodeRef.once("value", function (snapshot) {
            var data = snapshot.val();

            loadNodeData(data);

            nodeDataLoaded = true;

            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataLoadSuccessful
            });
        }, function (error) {
            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataLoadFailed,
                message: error
            });
        });

        nodeRef.on("child_changed", function (snapshot) {
            var item = snapshot.val(),
                sensorStatusChanged = false,
                index = updateSensorItem(item);

            if (item.status.name != nodeData[index].status.name) {
                sensorStatusChanged = true;
            }

            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataUpdateSuccessful,
                nodeItem: nodeData[index],
                sensorStatusChanged: sensorStatusChanged
            });
        }, function (error) {
            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataUpdateFailed,
                message: error
            });
        });
    }

    function fetchValueItem(id) {
        valueRef = firebase.database().ref().child('values').child(id).limitToLast(50);

        valueRef.once("value", function (snapshot) {
            var data = [];

            angular.forEach(snapshot.val(), function (item) {
                data.push({
                    x: new Date(item.timestamp),
                    y: item.value
                });
            });

            $rootScope.$emit(SERVICE_EVENTS.chartData, { statusCode: STATUS_CODES.dataLoadSuccessful, chartData: data });
            valueRef.off();
        }, function (error) {
            $rootScope.$emit(SERVICE_EVENTS.chartData, { statusCode: STATUS_CODES.dataLoadFailed, message: error });
            valueRef.off();
        });
    }

    function loadNodeData(data) {
        var index = -1;

        angular.forEach(data, function (item) {
            index = nodeData.push(item) - 1;

            switch (item.category) {
                case MAP_CATEGORIES.centre:
                    nodeData[index].icon = MAP_CENTRES[item.type.id].icon.cst001;
                    nodeData[index].status = CENTRE_STATUSES.cst001;
                    break;
                case MAP_CATEGORIES.location:
                    nodeData[index].icon = MAP_LOCATIONS[item.type.id].icon.lst001;
                    nodeData[index].status = LOCATION_STATUSES.lst001;
                    break;
                case MAP_CATEGORIES.sensor:

                    if (item.reading.value > item.reading.limit.moderate) {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst003;
                        nodeData[index].status = SENSOR_STATUSES.sst003;
                    } else if (item.reading.value > item.reading.limit.normal) {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst002;
                        nodeData[index].status = SENSOR_STATUSES.sst002;
                    } else {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst001;
                        nodeData[index].status = SENSOR_STATUSES.sst001;
                    }

                    break;
            }
        });
    }

    function updateSensorItem(item) {
        var index = nodeData.findIndex(
            function (nodeItem) {
                return nodeItem.id == item.id;
            }
        );

        if (item.category == MAP_CATEGORIES.sensor) {
            nodeData[index].reading.value = item.reading.value;

            if (item.reading.value > item.reading.limit.moderate) {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst003;
                nodeData[index].status = SENSOR_STATUSES.sst003;
            } else if (item.reading.value > item.reading.limit.normal) {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst002;
                nodeData[index].status = SENSOR_STATUSES.sst002;
            } else {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icon.sst001;
                nodeData[index].status = SENSOR_STATUSES.sst001;
            }

            if (item.coordinates.dynamic) {
                nodeData[index].coordinates.lat = item.coordinates.lat;
                nodeData[index].coordinates.lng = item.coordinates.lng;
            }
        }

        return index;
    }

    dataService.subscribeNodeData = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (nodeDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.nodeData, { statusCode: STATUS_CODES.dataLoadSuccessful });
        } else {
            //fetchNodeData();
            fetchLocalNodeData();
        }

        scope.$on('$destroy', handler);
    };

    function fetchLocalNodeData() {
        $.getJSON("mapmysensor.json", function (data) {
            loadNodeData(data.nodes);

            nodeDataLoaded = true;

            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataLoadSuccessful
            });
        });
    }

    dataService.subscribeChartData = function (id, scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        fetchValueItem(id);

        scope.$on('$destroy', handler);
    };

    dataService.getNodeData = function () {
        return nodeData;
    };

    dataService.getNodeItem = function (id) {
        var item = nodeData.find(
            function (nodeItem) {
                return nodeItem.id == id
            }
        );

        return item;
    };

    dataService.appendNodeItem = function (item) {
        nodeData.push(item);
    };

    dataService.updateNodeItem = function (item) {
        var index = nodeData.findIndex(
            function (nodeItem) {
                return nodeItem.id == item.id
            }
        );

        nodeData[index] = item;
    };

    dataService.getNodeChildren = function (id) {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.parentId == id
            }
        );

        return data;
    };

    dataService.getCentreData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.centre;
            }
        );

        return data;
    };

    dataService.getLocationData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.location;
            }
        );

        return data;
    };

    dataService.getSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor;
            }
        );

        return data;
    };

    dataService.getNormalSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst001.name;
            }
        );

        return data;
    };

    dataService.getNormalSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst001.name;
            }
        );

        return data.length;
    };


    dataService.getFailedSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst002.name;
            }
        );

        return data;
    };

    dataService.getModerateSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst002.name;
            }
        );

        return data.length;
    };

    dataService.getAbnormalSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst003.name;
            }
        );

        return data;
    };

    dataService.getSevereSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category == MAP_CATEGORIES.sensor && nodeItem.status.name == SENSOR_STATUSES.sst003.name;
            }
        );

        return data.length;
    };

    dataService.deleteCustomCentreData = function () {
        nodeData = nodeData.filter(
            function (nodeItem) {
                return nodeItem.type.id != 'ct006';
            }
        );
    };

    $rootScope.$on('$destroy', function () {
        nodeRef.off();
    });

    return dataService;
});