var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, MAP_CATEGORIES, MAP_CENTRES, CENTRE_STATUSES, MAP_LOCATIONS, LOCATION_STATUSES, DISASTER_TYPES, MAP_SENSORS, SENSOR_STATUSES, STATUS_CODES, SERVICE_EVENTS) {
    var dataService = {};

    var nodeData = [],
        nodeIds = {},
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

            switch (item.category.id) {
                case MAP_CATEGORIES.c001.id:
                    nodeData[index].icon = MAP_CENTRES[item.type.id].icons.cst001;
                    nodeData[index].status = CENTRE_STATUSES.cst001;
                    break;
                case MAP_CATEGORIES.c002.id:
                    nodeData[index].icon = MAP_LOCATIONS[item.type.id].icons.lst001;
                    nodeData[index].status = LOCATION_STATUSES.lst001;
                    nodeData[index].status.disasterId = null;
                    break;
                case MAP_CATEGORIES.c003.id:

                    if (item.reading.value > item.reading.limit.moderate) {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst003;
                        nodeData[index].status = SENSOR_STATUSES.sst003;
                    } else if (item.reading.value > item.reading.limit.normal) {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst002;
                        nodeData[index].status = SENSOR_STATUSES.sst002;
                    } else {
                        nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst001;
                        nodeData[index].status = SENSOR_STATUSES.sst001;
                    }

                    nodeData[index].status.disasterId = item.disasterId;
                    break;
            }

            nodeIds[item.id] = index;
        });
    }

    function updateSensorItem(item) {
        var index = nodeIds[item.id];

        if (item.category.id == MAP_CATEGORIES.c003.id) {
            nodeData[index].reading.value = item.reading.value;

            if (item.reading.value > item.reading.limit.moderate) {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst003;
                nodeData[index].status = SENSOR_STATUSES.sst003
            } else if (item.reading.value > item.reading.limit.normal) {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst002;
                nodeData[index].status = SENSOR_STATUSES.sst002;
            } else {
                nodeData[index].icon = MAP_SENSORS[item.type.id].icons.sst001;
                nodeData[index].status = SENSOR_STATUSES.sst001;
            }

            if (item.coordinates.dynamic) {
                nodeData[index].coordinates = item.coordinates;
            }
        }

        return index;
    }

    function updateNodeStatus(id) {
        var index = nodeIds[id];

        if (nodeData[index].category.id == MAP_CATEGORIES.c002.id) {
            var childrenNodes = nodeData.filter(function (nodeItem) { return nodeItem.parentId == id }),
                disasterScore = 0,
                maxDisasterId = '',
                maxDisasterScore = 0,
                totalDisasterScore = 0;
            i;

            for (i = 0; i < childrenNodes.length; i++) {
                disasterScore = childrenNodes[i].disasterScore[childrenNodes[i].status.id];

                if (maxDisasterScore < disasterScore) {
                    maxDisasterScore = disasterScore;
                    maxDisasterId = childrenNodes[i].status.disasterId;
                }

                totalDisasterScore += disasterScore;
            }

            if (disasterScore > nodeData[index].disasterScore.lst002) {
                nodeData[index].icon = MAP_SENSORS[nodeData[index].type.id].icons.lst003;
                nodeData[index].status.id = LOCATION_STATUSES.sst003.id;
                nodeData[index].status.name = LOCATION_STATUSES.lst003.name;
                nodeData[index].status.disasterId = maxDisasterId;

                if (DISASTER_TYPES[maxDisasterId].hasLevels) {
                    nodeData[index].status.icon = DISASTER_TYPES[maxDisasterId].icons.lst003;
                } else {
                    nodeData[index].status.icon = DISASTER_TYPES[maxDisasterId].icon;
                }
            }
        }
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

        //fetchValueItem(id);
        fetchLocalValueData()

        scope.$on('$destroy', handler);
    };

    function fetchLocalValueData() {
        $.getJSON("mapmysensor.json", function (data) {
            var chartData = [];

            angular.forEach(data.values.s001, function (item) {
                chartData.push({
                    x: new Date(item.timestamp),
                    y: item.value
                });
            });

            $rootScope.$emit(SERVICE_EVENTS.chartData, {
                statusCode: STATUS_CODES.dataLoadSuccessful,
                chartData: chartData
            });
        });
    }

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
                return nodeItem.category.id == MAP_CATEGORIES.c001.id;
            }
        );

        return data;
    };

    dataService.getLocationData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c002.id;
            }
        );

        return data;
    };

    dataService.getSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id;
            }
        );

        return data;
    };

    dataService.getNormalSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst001.name;
            }
        );

        return data;
    };

    dataService.getNormalSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst001.name;
            }
        );

        return data.length;
    };


    dataService.getFailedSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst002.name;
            }
        );

        return data;
    };

    dataService.getSevereSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst002.name;
            }
        );

        return data.length;
    };

    dataService.getAbnormalSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst003.name;
            }
        );

        return data;
    };

    dataService.getExtremeSensorCount = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == MAP_CATEGORIES.c003.id && nodeItem.status.name == SENSOR_STATUSES.sst003.name;
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