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

    routeService.getEmergencyRouteData = function () {
        var centreData = DataService.getCentreData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            selectedCentreData;

        if (disasterAffectedClusterData.length > 0) {
            selectedCentreData = sourceSelectionAlgorithm(
                centreData,
                disasterAffectedClusterData,
                MAP_ROUTES.r001
            );

            return routeGenerationAlgorithm(
                selectedCentreData,
                disasterAffectedClusterData,
                LOCATION_STATUSES,
                MAP_ROUTES.r001
            );
        } else {
            return [];
        }
    };

    routeService.getHospitalRouteData = function () {
        var hospitalData = DataService.getHospitalData(),
            disasterAffectedClusterData = DataService.getDisasterAffectedClusterData(),
            selectedHospitalData;

        if (disasterAffectedClusterData.length > 0) {
            selectedHospitalData = sourceSelectionAlgorithm(
                hospitalData,
                disasterAffectedClusterData,
                MAP_ROUTES.r002
            );

            return routeGenerationAlgorithm(
                selectedHospitalData,
                disasterAffectedClusterData,
                LOCATION_STATUSES,
                MAP_ROUTES.r002
            );
        } else {
            return [];
        }
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
                        if ((routeType.id == 'r001' && sourceData[j].type.id != waypointData[i].disaster.centreTypeId) || (routeType.id == 'r002' && waypointData[i].disaster.hospitalRequired == false)) {
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
            routeData = [],
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
            routeData.push({
                information: {
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
                        if ((routeType.id == 'r001' && sourceData[i].type.id != waypointData[j].disaster.centreTypeId) || (routeType.id == 'r002' && waypointData[j].disaster.hospitalRequired == false)) {
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

                        totalRouteScore = routeData[i].information.totalRouteScore;

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

            routeData[selectedSourceIndex].information.destination = waypointData[selectedWaypointIndex].name;
            routeData[selectedSourceIndex].information.totalDistance += minDistance;
            routeData[selectedSourceIndex].information.totalRouteScore += maxRouteScore;
            routeData[selectedSourceIndex].information.totalNodes += 1;

            routeData[selectedSourceIndex].path.push(waypointData[selectedWaypointIndex]);

            previousIndexes[selectedSourceIndex] = selectedWaypointIndex;

            visitedIndexes.push(selectedWaypointIndex);
        }

        routeData = routeData.filter(function (routeItem) {
            return routeItem.information.totalNodes > 1;
        });

        for (i = 0; i < routeData.length; i++) {
            routeData[i].information.totalDistance = (Math.round(routeData[i].information.totalDistance * 1000) / 1000);
            routeData[i].information.totalRouteScore = (Math.round(routeData[i].information.totalRouteScore * 1000) / 1000);
        }

        return routeData;
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