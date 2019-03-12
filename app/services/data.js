var app = angular.module('sensorApp');

app.factory('DataService', function ($rootScope, MAP_CENTRES, CENTRE_STATUSES, MAP_LOCATIONS, LOCATION_STATUSES, DISASTER_TYPES, MAP_SENSORS, SENSOR_STATUSES, STATUS_CODES, SERVICE_EVENTS) {
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

            $rootScope.$emit(SERVICE_EVENTS.chartData, {
                statusCode: STATUS_CODES.dataLoadSuccessful,
                chartData: data
            });
            valueRef.off();
        }, function (error) {
            $rootScope.$emit(SERVICE_EVENTS.chartData, {
                statusCode: STATUS_CODES.dataLoadFailed,
                message: error
            });
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
                    nodeData[nodeIndex].status = angular.copy(CENTRE_STATUSES.cst001);
                    break;
                case 'c002':
                    nodeData[nodeIndex].icon = MAP_LOCATIONS[item.type.id].icons.lst001;
                    nodeData[nodeIndex].status = angular.copy(LOCATION_STATUSES.lst001);
                    nodeData[nodeIndex].disaster = {};

                    nodeData[nodeIndex].disaster = {};
                    break;
                case 'c003':
                    nodeData[nodeIndex].icon = MAP_SENSORS[nodeData[nodeIndex].type.id].icons.sst001;
                    nodeData[nodeIndex].status = angular.copy(SENSOR_STATUSES.sst001);
                    nodeData[nodeIndex].disaster = angular.copy(DISASTER_TYPES[nodeData[nodeIndex].disasterId]);

                    updateNodeStatus(nodeIndex);
                    break;
            }

            nodeIds[item.id] = nodeIndex;
        });
    }

    function updateNodeItem(item) {
        var nodeIndex = nodeIds[item.id],
            updatedNodeIds = [];

        switch (item.category.id) {
            case 'c001':
                break;
            case 'c002':
                break;
            case 'c003':
                nodeData[nodeIndex].reading.value = item.reading.value;

                if (nodeData[nodeIndex].coordinates.dynamic) {
                    nodeData[nodeIndex].coordinates.lat = item.coordinates.lat;
                    nodeData[nodeIndex].coordinates.lng = item.coordinates.lng;
                }

                updatedNodeIds = updateNodeStatus(nodeIndex);
                break;
        }

        return updatedNodeIds;
    }

    function updateNodeStatus(nodeIndex) {
        var currentNodeIndex = nodeIndex,
            updatedNodeIds = [],
            childrenNodes = [],
            disasterScore = 0,
            selectedDisasterId = '',
            maxDisasterScore = 0,
            totalDisasterScore = 0,
            oldStatusId = '',
            newStatusId = '',
            i;

        while (1) {
            oldStatusId = nodeData[currentNodeIndex].status.id;

            switch (nodeData[currentNodeIndex].category.id) {
                case 'c002':
                    disasterScore = 0;
                    maxDisasterScore = 0;
                    totalDisasterScore = 0;

                    childrenNodes = nodeData.filter(
                        function (item) {
                            return item.parentId == nodeData[currentNodeIndex].id && (item.category.id == 'c002' || item.category.id == 'c003');
                        }
                    );

                    for (i = 0; i < childrenNodes.length; i++) {
                        disasterScore = angular.copy(childrenNodes[i].disaster.score);

                        if (maxDisasterScore < disasterScore) {
                            maxDisasterScore = disasterScore;
                            selectedDisasterId = childrenNodes[i].disaster.id;
                        }

                        totalDisasterScore += disasterScore;
                    }

                    if (totalDisasterScore > nodeData[currentNodeIndex].disasterScore.lst002) {
                        nodeData[currentNodeIndex].icon = MAP_LOCATIONS[nodeData[currentNodeIndex].type.id].icons.lst003;
                        nodeData[currentNodeIndex].status = angular.copy(LOCATION_STATUSES.lst003);

                        nodeData[currentNodeIndex].status.icon = DISASTER_TYPES[selectedDisasterId].icons.lst003;
                        nodeData[currentNodeIndex].status.name = LOCATION_STATUSES.lst003.name + ' ' + DISASTER_TYPES[selectedDisasterId].name;

                        nodeData[currentNodeIndex].disaster = angular.copy(DISASTER_TYPES[selectedDisasterId]);
                    } else if (totalDisasterScore > nodeData[currentNodeIndex].disasterScore.lst001) {
                        nodeData[currentNodeIndex].icon = MAP_LOCATIONS[nodeData[currentNodeIndex].type.id].icons.lst002;
                        nodeData[currentNodeIndex].status = angular.copy(LOCATION_STATUSES.lst002);

                        nodeData[currentNodeIndex].status.icon = DISASTER_TYPES[selectedDisasterId].icons.lst002;
                        nodeData[currentNodeIndex].status.name = LOCATION_STATUSES.lst002.name + ' ' + DISASTER_TYPES[selectedDisasterId].name;

                        nodeData[currentNodeIndex].disaster = angular.copy(DISASTER_TYPES[selectedDisasterId]);
                    } else {
                        nodeData[currentNodeIndex].icon = MAP_LOCATIONS[nodeData[currentNodeIndex].type.id].icons.lst001;
                        nodeData[currentNodeIndex].status = angular.copy(LOCATION_STATUSES.lst001);

                        nodeData[currentNodeIndex].disaster = {};
                    }

                    nodeData[currentNodeIndex].disaster.score = totalDisasterScore;
                    break;
                case 'c003':
                    if (nodeData[currentNodeIndex].reading.value > nodeData[currentNodeIndex].reading.limit.sst001) {
                        nodeData[currentNodeIndex].icon = MAP_SENSORS[nodeData[currentNodeIndex].type.id].icons.sst003;
                        nodeData[currentNodeIndex].status = angular.copy(SENSOR_STATUSES.sst003)
                        nodeData[currentNodeIndex].disaster.score = nodeData[currentNodeIndex].disasterScore.sst003;
                    } else if (nodeData[currentNodeIndex].reading.value > nodeData[currentNodeIndex].reading.limit.sst002) {
                        nodeData[currentNodeIndex].icon = MAP_SENSORS[nodeData[currentNodeIndex].type.id].icons.sst001;
                        nodeData[currentNodeIndex].status = angular.copy(SENSOR_STATUSES.sst001);
                        nodeData[currentNodeIndex].disaster.score = nodeData[currentNodeIndex].disasterScore.sst001;
                    } else {
                        nodeData[currentNodeIndex].icon = MAP_SENSORS[nodeData[currentNodeIndex].type.id].icons.sst002;
                        nodeData[currentNodeIndex].status = angular.copy(SENSOR_STATUSES.sst002);
                        nodeData[currentNodeIndex].disaster.score = nodeData[currentNodeIndex].disasterScore.sst002;
                    }
                    break;
            }

            updatedNodeIds.push(nodeData[currentNodeIndex].id);

            newStatusId = nodeData[currentNodeIndex].status.id;

            if (oldStatusId == newStatusId || nodeData[currentNodeIndex].parentId == null) {
                break;
            }

            currentNodeIndex = nodeIds[nodeData[currentNodeIndex].parentId];
        }

        return updatedNodeIds;
    }

    dataService.subscribeNodeData = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (nodeDataLoaded) {
            $rootScope.$emit(SERVICE_EVENTS.nodeData, {
                statusCode: STATUS_CODES.dataLoadSuccessful
            });
        } else {
            fetchNodeData();
        }

        scope.$on('$destroy', handler);
    };

    dataService.subscribeChartData = function (id, scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        fetchValueItem(id);

        scope.$on('$destroy', handler);
    };

    dataService.getNodeData = function () {
        return nodeData;
    };

    dataService.getNodeItem = function (id) {
        return nodeData[nodeIds[id]];
    };

    dataService.appendNodeItem = function (item) {
        nodeData.push(item);
    };

    dataService.updateNodeItem = function (item) {
        nodeData[nodeIds[item.id]] = item;
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

    dataService.getHospitalData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == 'c001' && nodeItem.type.id == 'ct004';
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

    dataService.getDisasterAffectedClusterData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == 'c002' && nodeItem.type.id == 'lt004' && (nodeItem.status.id == 'lst002' || nodeItem.status.id == 'lst003');
            }
        );

        return data;
    };

    dataService.getSensorData = function () {
        var data = nodeData.filter(
            function (nodeItem) {
                return nodeItem.category.id == 'c003';
            }
        );

        return data;
    };

    $rootScope.$on('$destroy', function () {
        nodeRef.off();
    });

    return dataService;
});