var app = angular.module('app');

app.factory('RouteService', function (LOCATION_STATUSES, SENSOR_STATUSES, MAP_ROUTES, DataService) {
    var routeService = {};

    var customCentreData = [],
        customSensorData = [],
        customRouteStep = 1;

    routeService.setCustomRouteStep = function (data) {
        customRouteStep = data;
    };

    routeService.setCustomCentreData = function (data) {
        customCentreData = data;
    };

    routeService.setCustomSensorData = function (data) {
        customSensorData = data;
    };

    routeService.getCustomRouteStep = function () {
        return customRouteStep;
    };

    routeService.getCustomCentreData = function () {
        return customCentreData;
    };

    routeService.getCustomSensorData = function () {
        return customSensorData;
    };

    routeService.getDistanceMatrixData = function () {
        var distanceMatrixData = {
                info: {
                    nodeData: []
                },
                data: []
            },
            centreData = DataService.getCentreData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            selectedNodeData,
            tempCentreData1,
            tempCentreData2;

        if (disasterAffectedClusterData.length > 0) {
            var tempCentreData1 = sourceSelectionAlgorithm(
                centreData,
                disasterAffectedClusterData,
                MAP_ROUTES.r001
            );

            var tempCentreData2 = sourceSelectionAlgorithm(
                centreData,
                disasterAffectedClusterData,
                MAP_ROUTES.r002
            );

            selectedNodeData = disasterAffectedClusterData.concat(tempCentreData1, tempCentreData2);

            distanceMatrixData = generateDistanceMatrixData(selectedNodeData);
        }

        return distanceMatrixData;
    }

    routeService.getConnectivityGraphAdjacencyMatrixData = function () {
        var adjacencyMatrixData = {
                info: {
                    nodeData: []
                },
                data: []
            },
            selectedNodeData,
            distanceMatrixData,
            i,
            j;

        distanceMatrixData = routeService.getDistanceMatrixData();

        if (distanceMatrixData.info.nodeData.length > 0) {
            selectedNodeData = distanceMatrixData.info.nodeData;

            adjacencyMatrixData.info.nodeData = selectedNodeData;

            adjacencyMatrixData.data = Array(selectedNodeData.length).fill().map(() => Array(selectedNodeData.length).fill(0));

            for (i = 0; i < selectedNodeData.length; i++) {
                for (j = 0; j < selectedNodeData.length; j++) {
                    if ((i > j) && (selectedNodeData[i].category.id != 'c001' || selectedNodeData[j].category.id != 'c001')) {
                        adjacencyMatrixData.data[i][j] = 1;
                    }
                }
            }
        }

        return adjacencyMatrixData;
    }

    routeService.getSpanningTreeAdjacencyMatrixData = function () {
        var adjacencyMatrixData = {
                info: {
                    nodeData: []
                },
                data: []
            },
            selectedIndexes = [],
            count = 0,
            selectedNodeData,
            iIndex,
            jIndex,
            minDistance,
            i,
            j;

        distanceMatrixData = routeService.getDistanceMatrixData();

        if (distanceMatrixData.info.nodeData.length > 0) {
            selectedNodeData = distanceMatrixData.info.nodeData;

            adjacencyMatrixData.info.nodeData = selectedNodeData;

            adjacencyMatrixData.data = Array(selectedNodeData.length).fill().map(() => Array(selectedNodeData.length).fill(0));

            selectedIndexes = Array(selectedNodeData.length).fill(0);

            selectedIndexes[0] = 1;

            while (count < selectedNodeData.length - 1) {
                minDistance = Number.POSITIVE_INFINITY;
                iIndex = -1;
                jIndex = -1;

                for (i = 0; i < selectedNodeData.length; i++) {
                    if (selectedIndexes[i] == 1) {
                        for (j = 0; j < selectedNodeData.length; j++) {
                            if (selectedIndexes[j] == 0 && minDistance > distanceMatrixData.data[i][j] && (selectedNodeData[i].category.id != 'c001' || selectedNodeData[j].category.id != 'c001')) {
                                minDistance = distanceMatrixData.data[i][j];
                                iIndex = i;
                                jIndex = j
                            }
                        }
                    }
                }

                if (iIndex != -1 && jIndex != -1) {
                    adjacencyMatrixData.data[iIndex][jIndex] = 1;
                    selectedIndexes[jIndex] = 1;
                }

                count = count + 1;
            }

        }

        return adjacencyMatrixData;
    }

    routeService.getDisasterReliefRouteData = function () {
        var disasterReliefCentreData = DataService.getDisasterReliefCentreData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            disasterReliefRouteData = [],
            selectedCentreData;

        if (disasterAffectedClusterData.length > 0) {
            selectedCentreData = sourceSelectionAlgorithm(
                disasterReliefCentreData,
                disasterAffectedClusterData,
                MAP_ROUTES.r001
            );

            disasterReliefRouteData = routeGenerationAlgorithm(
                selectedCentreData,
                disasterAffectedClusterData,
                LOCATION_STATUSES,
                MAP_ROUTES.r001
            );
        }

        return disasterReliefRouteData;
    };

    routeService.getMedicalReliefRouteData = function () {
        var medicalReliefCentreData = DataService.getMedicalReliefCentreData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            medicalReliefRouteData = [],
            selectedCentreData;

        if (disasterAffectedClusterData.length > 0) {
            selectedCentreData = sourceSelectionAlgorithm(
                medicalReliefCentreData,
                disasterAffectedClusterData,
                MAP_ROUTES.r002
            );

            medicalReliefRouteData = routeGenerationAlgorithm(
                selectedCentreData,
                disasterAffectedClusterData,
                LOCATION_STATUSES,
                MAP_ROUTES.r002
            );
        }

        return medicalReliefRouteData;
    };

    routeService.getCustomRouteData = function () {
        return routeGenerationAlgorithm(
            customCentreData,
            customSensorData,
            SENSOR_STATUSES,
            MAP_ROUTES.r003
        );
    };

    function generateDistanceMatrixData(nodeData) {
        var distanceMatrixData = {
                info: {
                    nodeData: [],
                    mapping: {}
                },
                data: []
            },
            distance,
            i,
            j;

        distanceMatrixData.info.nodeData = nodeData;

        for (i = 0; i < nodeData.length; i++) {
            distanceMatrixData.data.push([]);
            distanceMatrixData.info.mapping[nodeData[i].id] = i;

            for (j = 0; j < nodeData.length; j++) {
                distance = computeDistance(
                    nodeData[i].coordinates.lat,
                    nodeData[i].coordinates.lng,
                    nodeData[j].coordinates.lat,
                    nodeData[j].coordinates.lng,
                );

                distance = (Math.round(distance * 1000) / 1000)

                distanceMatrixData.data[i].push(distance);
            }
        }

        return distanceMatrixData;
    }

    function sourceSelectionAlgorithm(sourceData, waypointData, routeType) {
        var selectedSourceData = [],
            selectedSourceLimit = waypointData.length,
            visitedIndexes = [],
            selectedNodeData,
            sourceIndex,
            waypointIndex,
            distance,
            distanceMatrixData,
            rating,
            routeScore,
            selectedSourceIndex,
            maxRouteScore,
            i,
            j;

        selectedNodeData = sourceData.concat(waypointData);

        distanceMatrixData = generateDistanceMatrixData(selectedNodeData);

        while (1) {
            maxRouteScore = 0;
            selectedSourceIndex = -1;

            for (i = 0; i < waypointData.length; i++) {
                for (j = 0; j < sourceData.length; j++) {
                    if (visitedIndexes.includes(j) == false) {
                        if ((routeType.id == 'r001' && sourceData[j].type.id != waypointData[i].disaster.disasterReliefCentreTypeId) || (routeType.id == 'r002' && waypointData[i].disaster.medicalReliefRequired == false)) {
                            continue;
                        }

                        waypointIndex = distanceMatrixData.info.mapping[waypointData[i].id];
                        sourceIndex = distanceMatrixData.info.mapping[sourceData[j].id];

                        distance = distanceMatrixData.data[waypointIndex][sourceIndex];

                        rating = sourceData[j].rating;

                        routeScore = (rating) / (distance);

                        if (maxRouteScore < routeScore) {
                            maxRouteScore = routeScore;
                            selectedSourceIndex = j;
                        }
                    }
                }
            }

            if (maxRouteScore == 0 || selectedSourceData.length == selectedSourceLimit) {
                break;
            }

            selectedSourceData.push(sourceData[selectedSourceIndex]);

            visitedIndexes.push(selectedSourceIndex);
        }

        return selectedSourceData;
    }

    function routeGenerationAlgorithm(sourceData, waypointData, statusData, routeType) {
        var visitedIndexes = [],
            previousIndexes = [],
            graphData = [],
            selectedNodeData,
            sourceIndex,
            waypointIndex,
            distance,
            distanceMatrixData,
            priority,
            rating,
            routeScore,
            totalRouteScore,
            selectedSourceIndex,
            selectedWaypointIndex,
            maxRouteScore,
            minDistance,
            i,
            j;

        selectedNodeData = sourceData.concat(waypointData);

        distanceMatrixData = generateDistanceMatrixData(selectedNodeData);

        for (i = 0; i < sourceData.length; i++) {
            graphData.push({
                info: {
                    type: routeType,
                    origin: sourceData[i].name,
                    destination: null,
                    totalNodes: 1,
                    totalDistance: 0,
                    totalRouteScore: 0
                },
                path: [
                    sourceData[i]
                ]
            });

            previousIndexes.push(-1);
        }

        while (1) {
            maxRouteScore = 0;
            selectedSourceIndex = -1;
            selectedWaypointIndex = -1;
            minDistance = 0;

            for (i = 0; i < sourceData.length; i++) {
                for (j = 0; j < waypointData.length; j++) {
                    if (visitedIndexes.includes(j) == false) {
                        if ((routeType.id == 'r001' && sourceData[i].type.id != waypointData[j].disaster.disasterReliefCentreTypeId) || (routeType.id == 'r002' && waypointData[j].disaster.medicalReliefRequired == false)) {
                            continue;
                        }

                        if (previousIndexes[i] == -1) {
                            sourceIndex = distanceMatrixData.info.mapping[sourceData[i].id];
                        } else {
                            sourceIndex = distanceMatrixData.info.mapping[waypointData[previousIndexes[i]].id];
                        }

                        waypointIndex = distanceMatrixData.info.mapping[waypointData[j].id];

                        distance = distanceMatrixData.data[sourceIndex][waypointIndex];

                        priority = statusData[waypointData[j].status.id].priority;

                        rating = sourceData[i].rating;

                        routeScore = (rating * priority) / (distance);

                        totalRouteScore = graphData[i].info.totalRouteScore;

                        if (maxRouteScore + totalRouteScore < routeScore + totalRouteScore) {
                            maxRouteScore = routeScore;
                            minDistance = distance;
                            selectedSourceIndex = i;
                            selectedWaypointIndex = j;
                        }
                    }
                }
            }

            if (maxRouteScore == 0) {
                break;
            }

            graphData[selectedSourceIndex].info.destination = waypointData[selectedWaypointIndex].name;
            graphData[selectedSourceIndex].info.totalDistance += minDistance;
            graphData[selectedSourceIndex].info.totalRouteScore += maxRouteScore;
            graphData[selectedSourceIndex].info.totalNodes += 1;

            graphData[selectedSourceIndex].path.push(waypointData[selectedWaypointIndex]);

            previousIndexes[selectedSourceIndex] = selectedWaypointIndex;

            visitedIndexes.push(selectedWaypointIndex);
        }

        graphData = graphData.filter(function (routeItem) {
            return routeItem.info.totalNodes > 1;
        });

        for (i = 0; i < graphData.length; i++) {
            graphData[i].info.totalDistance = (Math.round(graphData[i].info.totalDistance * 1000) / 1000);
            graphData[i].info.totalRouteScore = (Math.round(graphData[i].info.totalRouteScore * 1000) / 1000);
        }

        return graphData;
    }

    function computeDistance(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dlng = (lng2 - lng1) * (Math.PI / 180);

        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dlng / 2) * Math.sin(dlng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        return d;
    }

    return routeService;
});