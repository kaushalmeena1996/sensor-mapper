var app = angular.module('sensorApp');

app.factory('RouteService', function (MAP_CENTRES, MAP_SENSORS, SENSOR_STATUSES) {
    var routeService = {};

    var centreData = [],
        sensorData = [],
        routeStep = 1;

    routeService.setRouteStep = function (data) {
        routeStep = data;
    };

    routeService.setCentreData = function (data) {
        centreData = data;
    };

    routeService.setSensorData = function (data) {
        sensorData = data;
    };

    routeService.getRouteStep = function () {
        return routeStep;
    };

    routeService.getCentreData = function () {
        return centreData;
    };

    routeService.getSensorData = function () {
        return sensorData;
    };

    routeService.generateRoute = function () {
        return algorithm1(centreData, sensorData);
    };

    function algorithm1(centreData, sensorData) {
        var visitedSensors = [],
            tempData = [],
            routeData = [],
            distance,
            priority,
            rating,
            score,
            totalScore,
            i,
            j;

        for (i = 0; i < centreData.length; i++) {
            tempData.push({
                id: centreData[i].id,
                previousSensorIndex: -1,
                totalNodes: 1,
                totalScore: 0
            });

            routeData.push([
                centreData[i]
            ]);
        }

        while (1) {
            maxCentreIndex = -1;
            maxSensorIndex = -1;
            maxScore = 0;

            for (i = 0; i < centreData.length; i++) {
                for (j = 0; j < sensorData.length; j++) {
                    if (visitedSensors.includes(sensorData[j].id) == false) {
                        if (centreData[i].type == MAP_CENTRES.fireStation && sensorData[j].type != MAP_SENSORS.thermometer.name) {
                            continue;
                        }

                        if (tempData[i].previousSensorIndex == -1) {
                            distance = computeDistance(
                                centreData[i].latitude,
                                centreData[i].longitude,
                                sensorData[j].latitude,
                                sensorData[j].longitude
                            );
                        } else {
                            distance = computeDistance(
                                sensorData[tempData[i].previousSensorIndex].latitude,
                                sensorData[tempData[i].previousSensorIndex].longitude,
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

                        totalScore = tempData[i].totalScore;

                        if (maxScore + totalScore < score + totalScore) {
                            maxCentreIndex = i;
                            maxSensorIndex = j;
                            maxScore = score;
                        }
                    }
                }
            }

            if (maxScore) {
                tempData[maxCentreIndex].previousSensorIndex = maxSensorIndex;
                tempData[maxCentreIndex].totalScore += maxScore;
                tempData[maxCentreIndex].totalNodes += 1;

                visitedSensors.push(
                    sensorData[maxSensorIndex].id
                );

                routeData[maxCentreIndex].push(
                    sensorData[maxSensorIndex]
                );
            } else {
                break;
            }
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