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
                updatedNodeIds = updateNodeItem(item);

            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataUpdateSuccessful,
                updatedNodeIds: updatedNodeIds
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
        var nodeIndex = -1;

        angular.forEach(data, function (item) {
            nodeIndex = nodeData.push(item) - 1;

            switch (item.category.id) {
                case 'c001':
                    nodeData[nodeIndex].icon = MAP_CENTRES[item.type.id].icons.cst001;
                    nodeData[nodeIndex].status = CENTRE_STATUSES.cst001;
                    break;
                case 'c002':
                    nodeData[nodeIndex].icon = MAP_LOCATIONS[item.type.id].icons.lst001;
                    nodeData[nodeIndex].status = LOCATION_STATUSES.lst001;
                    break;
                case 'c003':
                    if (item.reading.value > item.reading.limit.moderate) {
                        nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst003;
                        nodeData[nodeIndex].status = SENSOR_STATUSES.sst003;
                    } else if (item.reading.value > item.reading.limit.normal) {
                        nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst002;
                        nodeData[nodeIndex].status = SENSOR_STATUSES.sst002;
                    } else {
                        nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst001;
                        nodeData[nodeIndex].status = SENSOR_STATUSES.sst001;
                    }
                    break;
            }

            nodeIds[item.id] = nodeIndex;
        });
    }

    function updateNodeItem(item) {
        var nodeIndex = nodeIds[item.id],
            updatedNodeIds = [];

        updatedNodeIds.push(item.id);

        switch (item.category.id) {
            case 'c001':
                break;
            case 'c002':
                break;
            case 'c003':
                nodeData[nodeIndex].reading.value = item.reading.value;

                if (item.reading.value > item.reading.limit.moderate) {
                    nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst003;
                    nodeData[nodeIndex].status = SENSOR_STATUSES.sst003
                } else if (item.reading.value > item.reading.limit.normal) {
                    nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst002;
                    nodeData[nodeIndex].status = SENSOR_STATUSES.sst002;
                } else {
                    nodeData[nodeIndex].icon = MAP_SENSORS[item.type.id].icons.sst001;
                    nodeData[nodeIndex].status = SENSOR_STATUSES.sst001;
                }

                if (item.coordinates.dynamic) {
                    nodeData[nodeIndex].coordinates.lat = item.coordinates.lat;
                    nodeData[nodeIndex].coordinates.lng = item.coordinates.lng;
                }
                break;
        }

        return updatedNodeIds;
    }

    function updateNodeStatus(id) {
        var nodeIndex = nodeIds[id];

        if (nodeData[nodeIndex].category.id == 'c002') {
            var childrenNodes = nodeData.filter(function (nodeItem) { return nodeItem.parentId == id }),
                disasterScore = 0,
                maxDisasterId = '',
                maxDisasterScore = 0,
                totalDisasterScore = 0,
                i;

            for (i = 0; i < childrenNodes.length; i++) {
                disasterScore = childrenNodes[i].disasterScore[childrenNodes[i].status.id];

                if (maxDisasterScore < disasterScore) {
                    maxDisasterScore = disasterScore;
                    maxDisasterId = childrenNodes[i].status.disasterId;
                }

                totalDisasterScore += disasterScore;
            }

            if (totalDisasterScore > nodeData[nodeIndex].disasterScore.lst002) {
                nodeData[nodeIndex].icon = MAP_SENSORS[nodeData[nodeIndex].type.id].icons.lst003;
                nodeData[nodeIndex].status.id = LOCATION_STATUSES.sst003.id;
                nodeData[nodeIndex].status.name = LOCATION_STATUSES.lst003.name;
                nodeData[nodeIndex].status.disasterId = maxDisasterId;

                if (DISASTER_TYPES[maxDisasterId].hasLevels) {
                    nodeData[nodeIndex].status.icon = DISASTER_TYPES[maxDisasterId].icons.lst003;
                } else {
                    nodeData[nodeIndex].status.icon = DISASTER_TYPES[maxDisasterId].icon;
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

    dataService.subscribeChartData = function (id, scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        //fetchValueItem(id);
        fetchLocalValueData()

        scope.$on('$destroy', handler);
    };

    dataService.getNodeData = function () {
        return nodeData;
    };

    dataService.getFilteredNodeData = function (categoryId, statusId) {
        var item = nodeData.find(
            function (nodeItem) {
                return nodeItem.category.id == categoryId && nodeItem.status.id == statusId;
            }
        );

        return item;
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
        var nodeIndex = nodeData.findIndex(
            function (nodeItem) {
                return nodeItem.id == item.id
            }
        );

        nodeData[nodeIndex] = item;
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
                return nodeItem.category.id == 'c001';
            }
        );

        return data;
    };

    dataService.getLocationData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == 'c002';
            }
        );

        return data;
    };

    dataService.getAbnormalLocationData = function () {
        var item = nodeData.find(
            function (nodeItem) {
                return nodeItem.category.id == 'c002' && (nodeItem.status.id == 'lst002' || nodeItem.status.id == 'lst003');
            }
        );

        return item;
    };

    dataService.getSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == 'c003';
            }
        );

        return data;
    };

    dataService.deleteCustomCentreData = function () {
        nodeData = nodeData.filter(
            function (nodeItem) {
                return nodeItem.type.id != 'ctxxx';
            }
        );
    };

    $rootScope.$on('$destroy', function () {
        nodeRef.off();
    });

    // Test Functions

    function getJSON(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                callback(xhr.response);
            } else {
                callback(xhr.response, status);
            }
        };
        xhr.send();
    };

    function fetchLocalNodeData() {
        getJSON("mapmysensor.json", function (data) {
            loadNodeData(data.nodes);

            nodeDataLoaded = true;

            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataLoadSuccessful
            });
        });
    }

    function fetchLocalValueData() {
        getJSON("mapmysensor.json", function (data) {
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

    dataService.updateLocalNodeData = function () {
        var item = {
            id: "s001",
            parentId: "l012",
            category: {
                id: "c003",
                name: "Sensor"
            },
            name: "SensorC",
            address: "Swami Vivekanand Bhavan, SVNIT Campus, Athwa, Surat, Gujarat 395007",
            type: {
                id: "st002",
                name: "Thermometer"
            },
            photo: "assets/img/default-photo.png",
            description: "",
            leafNode: true,
            display: true,
            zoom: 19,
            boundary: null,
            disasterId: "dt001",
            disasterScore: {
                sst001: 0,
                sst002: 30,
                sst003: 60
            },
            reading: {
                value: 50,
                unit: "°C",
                boolean: false,
                limit: {
                    sst001: 100,
                    sst002: 200,
                    sst003: 500
                }
            },
            coordinates: {
                lat: 21.162866,
                lng: 72.790458,
                dynamic: false
            },
            updated: 1518244200000,
            created: 1518244200000
        };

        var updatedNodeIds = updateNodeItem(item);

        $rootScope.$emit(SERVICE_EVENTS.nodeData, {
            statusCode: STATUS_CODES.dataUpdateSuccessful,
            updatedNodeIds: updatedNodeIds
        });
    };

    return dataService;
});