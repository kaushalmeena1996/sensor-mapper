var app = angular.module('sensorApp');

app.factory('RouteService', function (MAP_CENTRES, MAP_SENSORS, SENSOR_STATUSES, MAP_ROUTES, DataService) {
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
            abnormalSensorData = DataService.getAbnormalSensorData(),
            selectedCentreData;

        if (abnormalSensorData) {
            selectedCentreData = centreSelectionAlgorithm1(
                centreData,
                abnormalSensorData
            );

            return routeGenerationAlgorithm1(
                selectedCentreData,
                abnormalSensorData,
                MAP_ROUTES.emergency
            );
        } else {
            return [];
        }
    };

    routeService.getCustomRouteData = function () {
        return routeGenerationAlgorithm1(
            customCentreData,
            customSensorData,
            MAP_ROUTES.custom
        );
    };

    function centreSelectionAlgorithm1(centreData, sensorData) {
        var selectedCentreData = [],
            selectedCentreIds = [],
            distance,
            rating,
            score,
            maxCentreIndex,
            maxScore,
            i,
            j;

        while (1) {
            maxCentreIndex = -1;
            maxScore = 0;

            for (i = 0; i < sensorData.length; i++) {
                for (j = 0; j < centreData.length; j++) {
                    if (selectedCentreIds.includes(centreData[j].id) == false) {
                        distance = computeDistance(
                            sensorData[i].coordinates.lat,
                            sensorData[i].coordinates.lng,
                            centreData[j].coordinates.lat,
                            centreData[j].coordinates.lng,
                        );

                        rating = centreData[j].rating;

                        score = (rating) / (distance);

                        if (maxScore < score) {
                            maxCentreIndex = j;
                            maxScore = score;
                        }
                    }
                }
            }

            if (maxScore > 0) {
                selectedCentreData.push(
                    centreData[maxCentreIndex]
                );

                selectedCentreIds.push(
                    centreData[maxCentreIndex].id
                );
            } else {
                break;
            }
        }

        return selectedCentreData;
    }

    function routeGenerationAlgorithm1(centreData, sensorData, routeType) {
        var visitedSensors = [],
            routeData = [],
            distance,
            priority,
            rating,
            score,
            totalScore,
            maxCentreIndex,
            maxSensorIndex,
            minDistance,
            maxScore,
            i,
            j;

        for (i = 0; i < centreData.length; i++) {
            routeData.push({
                routeInfo: {
                    routeType: routeType,
                    previousSensorIndex: -1,
                    origin: centreData[i].name,
                    destination: null,
                    totalNodes: 1,
                    totalDistance: 0,
                    totalScore: 0
                },
                routeArray: [
                    centreData[i]
                ]
            });
        }

        while (1) {
            maxCentreIndex = -1;
            maxSensorIndex = -1;
            minDistance = 0;
            maxScore = 0;

            for (i = 0; i < centreData.length; i++) {
                for (j = 0; j < sensorData.length; j++) {
                    if (visitedSensors.includes(sensorData[j].id) == false) {
                        if (centreData[i].type.name == MAP_CENTRES.ct004.name && sensorData[j].type.name != MAP_SENSORS.st002.name) {
                            continue;
                        }

                        if (routeData[i].routeInfo.previousSensorIndex == -1) {
                            distance = computeDistance(
                                centreData[i].coordinates.lat,
                                centreData[i].coordinates.lng,
                                sensorData[j].coordinates.lat,
                                sensorData[j].coordinates.lng
                            );
                        } else {
                            distance = computeDistance(
                                sensorData[routeData[i].routeInfo.previousSensorIndex].coordinates.lat,
                                sensorData[routeData[i].routeInfo.previousSensorIndex].coordinates.lng,
                                sensorData[j].coordinates.lat,
                                sensorData[j].coordinates.lng,
                            );
                        }

                        switch (sensorData[j].status) {
                            case SENSOR_STATUSES.sst001.name:
                                priority = 1;
                                break;
                            case SENSOR_STATUSES.sst002.name:
                                priority = 5;
                                break;
                            case SENSOR_STATUSES.sst003.name:
                                priority = 10;
                                break;
                            default:
                                priority = 1;
                        }

                        rating = centreData[i].rating;

                        score = (rating * priority) / (distance);

                        totalScore = routeData[i].routeInfo.totalScore;

                        if (maxScore + totalScore < score + totalScore) {
                            maxCentreIndex = i;
                            maxSensorIndex = j;
                            minDistance = distance;
                            maxScore = score;
                        }
                    }
                }
            }

            if (maxScore > 0) {
                routeData[maxCentreIndex].routeInfo.previousSensorIndex = maxSensorIndex;
                routeData[maxCentreIndex].routeInfo.destination = sensorData[maxSensorIndex].name;
                routeData[maxCentreIndex].routeInfo.totalDistance += minDistance;
                routeData[maxCentreIndex].routeInfo.totalScore += maxScore;
                routeData[maxCentreIndex].routeInfo.totalNodes += 1;

                routeData[maxCentreIndex].routeArray.push(
                    sensorData[maxSensorIndex]
                );

                visitedSensors.push(
                    sensorData[maxSensorIndex].id
                );
            } else {
                break;
            }
        }

        routeData = routeData.filter(function (e) {
            return e.routeInfo.totalNodes > 1;
        });

        for (i = 0; i < routeData.length; i++) {
            routeData[i].routeInfo.totalDistance = (Math.round(routeData[i].routeInfo.totalDistance * 1000) / 1000);
            routeData[i].routeInfo.totalScore = (Math.round(routeData[i].routeInfo.totalScore * 1000) / 1000);
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