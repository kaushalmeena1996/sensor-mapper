var app = angular.module('sensorApp');

app.factory('RouteService', function (MAP_CENTRES, MAP_SENSORS, SENSOR_STATUSES, MAP_ROUTES, DataService) {
    var routeService = {};

    var customCentreData = [],
        customeSensorData = [],
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
        return customeSensorData;
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
            selectedCentreLimit = 5,
            distance,
            rating,
            score,
            maxCentreIndex,
            maxScore,
            i,
            j;

        while (1) {
            maxScore = 0;

            for (i = 0; i < sensorData.length; i++) {
                for (j = 0; j < centreData.length; j++) {
                    if (selectedCentreIds.includes(centreData[j].id) == false) {
                        distance = computeDistance(
                            sensorData[i].latitude,
                            sensorData[i].longitude,
                            centreData[j].latitude,
                            centreData[j].longitude
                        );

                        rating = centreData[i].rating;

                        score = (rating) / (distance);

                        if (maxScore < score) {
                            maxCentreIndex = j;
                            maxScore = score;
                        }
                    }
                }
            }

            if (maxScore > 0 && selectedCentreData.length < selectedCentreLimit) {
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
                        if (centreData[i].type == MAP_CENTRES.fireStation && sensorData[j].type != MAP_SENSORS.thermometer.name) {
                            continue;
                        }

                        if (routeData[i].routeInfo.previousSensorIndex == -1) {
                            distance = computeDistance(
                                centreData[i].latitude,
                                centreData[i].longitude,
                                sensorData[j].latitude,
                                sensorData[j].longitude
                            );
                        } else {
                            distance = computeDistance(
                                sensorData[routeData[i].routeInfo.previousSensorIndex].latitude,
                                sensorData[routeData[i].routeInfo.previousSensorIndex].longitude,
                                sensorData[j].latitude,
                                sensorData[j].longitude
                            );
                        }

                        switch (sensorData[j].status) {
                            case SENSOR_STATUSES.normal:
                                priority = 1;
                                break;
                            case SENSOR_STATUSES.failure:
                                priority = 5;
                                break;
                            case SENSOR_STATUSES.abnormal:
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
                routeData[maxCentreIndex].routeInfo.totalDistance += (Math.round(minDistance * 1000) / 1000);
                routeData[maxCentreIndex].routeInfo.totalScore += (Math.round(maxScore * 1000) / 1000);
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