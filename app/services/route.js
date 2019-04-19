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

    routeService.getConnectiviyGraph = function () {
        var centreData = DataService.getCentreData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            selectedCentreData,
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

            selectedCentreData = tempCentreData1.concat(tempCentreData2)

            disasterReliefRouteData = routeGenerationAlgorithm(
                selectedCentreData,
                disasterAffectedClusterData,
                LOCATION_STATUSES,
                MAP_ROUTES.r001
            );
        }
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
            MAP_ROUTES.rxxx
        );
    };

    function sourceSelectionAlgorithm(sourceData, waypointData, routeType) {
        var selectedSourceData = [],
            selectedSourceLimit = waypointData.length,
            visitedIndexes = [],
            distance,
            rating,
            routeScore,
            selectedSourceIndex,
            maxRouteScore,
            i,
            j;

        while (1) {
            maxRouteScore = 0;
            selectedSourceIndex = -1;

            for (i = 0; i < waypointData.length; i++) {
                for (j = 0; j < sourceData.length; j++) {
                    if (visitedIndexes.includes(j) == false) {
                        if ((routeType.id == 'r001' && sourceData[j].type.id != waypointData[i].disaster.disasterReliefCentreTypeId) || (routeType.id == 'r002' && waypointData[i].disaster.medicalReliefRequired == false)) {
                            continue;
                        }

                        distance = computeDistance(
                            waypointData[i].coordinates.lat,
                            waypointData[i].coordinates.lng,
                            sourceData[j].coordinates.lat,
                            sourceData[j].coordinates.lng,
                        );

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
            distance,
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
                            distance = computeDistance(
                                sourceData[i].coordinates.lat,
                                sourceData[i].coordinates.lng,
                                waypointData[j].coordinates.lat,
                                waypointData[j].coordinates.lng
                            );
                        } else {
                            distance = computeDistance(
                                waypointData[previousIndexes[i]].coordinates.lat,
                                waypointData[previousIndexes[i]].coordinates.lng,
                                waypointData[j].coordinates.lat,
                                waypointData[j].coordinates.lng,
                            );
                        }

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