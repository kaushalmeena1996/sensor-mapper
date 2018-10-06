var app = angular.module('sensorApp');
var map;

app.controller('MapCtrl', function ($scope, $http, $location, $timeout, $sessionStorage, MAP_CATEGORIES, MAP_CENTRES, SENSOR_STATUSES, PAGE_EVENTS) {
    $scope.nodeData = [];
    $scope.abnormalSensor = 0;

    $scope.routeMode = false;

    $scope.getNodes = function () {
        $scope.$parent.showLoadingOverlay();
        $http
            .get(API_URLS.getNodes)
            .then(function (response) {
                    $scope.$parent.hideLoadingOverlay();
                    if (response.data.success) {
                        var result = response.data.result,
                            marker,
                            i,
                            j;

                        $scope.nodeData = response.data.result;

                        for (i = 0; i < result.length; i++) {
                            if (result[i].display) {

                                if (result[i].status == SENSOR_STATUSES.abnormal) {
                                    $scope.abnormalSensor += 1;
                                }

                                marker = new google.maps.Marker({
                                    title: result[i].name,
                                    position: {
                                        lat: result[i].latitude,
                                        lng: result[i].longitude
                                    },
                                    icon: result[i].icon
                                });

                                marker.setMap(map);

                                if (result[i].bounds) {
                                    var bounds = result[i].bounds.split(";"),
                                        polygon,
                                        paths = [];

                                    for (j = 0; j < bounds.length; j++) {
                                        paths.push({
                                            lat: parseFloat(bounds[j].split(',')[0]),
                                            lng: parseFloat(bounds[j].split(',')[1])
                                        });
                                    }

                                    polygon = new google.maps.Polygon({
                                        paths: paths,
                                        strokeColor: result[i].color,
                                        strokeOpacity: 0.3,
                                        strokeWeight: 1,
                                        fillColor: result[i].color,
                                        fillOpacity: 0.2,
                                    });

                                    polygon.setMap(map);
                                }
                            }
                        }

                        /*
                        if ($scope.abnormalSensor > 0 && $scope.routeMode == false) {
                            $("#promptModal").modal('show');
                        }
                        */
                    }
                    if ('messages' in response.data) {
                        $scope.$emit(PAGE_EVENTS.sendMessage, {
                            messages: response.data.messages,
                            persist: 1,
                            interruptive: true
                        });
                    }
                },
                function () {
                    $scope.$parent.hideLoadingOverlay();
                    $scope.$emit(PAGE_EVENTS.sendMessage, {
                        messages: ["Error: Something went wrong with API call."],
                        persist: 1,
                        interruptive: true
                    });
                });
    };

    $scope.generateRequests = function (routeData) {
        var requestArray = [],
            requestObject,
            marker,
            i;

        for (i = 0; i < routeData.length; i++) {

            if (routeData[i].length <= 1) {
                continue;
            }

            if (routeData[i][0].type == MAP_CENTRES.custom.name) {
                marker = new google.maps.Marker({
                    title: routeData[i][0].name,
                    position: {
                        lat: routeData[i][0].latitude,
                        lng: routeData[i][0].longitude
                    },
                    icon: routeData[i][0].icon
                });
                marker.setMap(map);
            }

            requestObject = {
                origin: null,
                destination: null,
                travelMode: 'DRIVING'
            };

            requestObject.origin = {
                lat: routeData[i][0].latitude,
                lng: routeData[i][0].longitude
            };

            if (routeData[0].length > 2) {
                requestObject.waypoints = [];
                for (j = 1; j < routeData[i].length - 1; j++) {
                    requestObject.waypoints.push({
                        location: {
                            lat: routeData[i][j].latitude,
                            lng: routeData[i][j].longitude
                        },
                        stopover: true
                    });
                }
            }

            requestObject.destination = {
                lat: routeData[i][routeData[i].length - 1].latitude,
                lng: routeData[i][routeData[i].length - 1].longitude
            };

            requestArray.push(requestObject);
        }

        $scope.processRequests(requestArray);
    };

    $scope.processRequests = function (requestArray) {
        var directionsService = new google.maps.DirectionsService(),
            colorArray = ["#2471A3", "#17A589", "#229954", "#D4AC0D", "#CA6F1E", "#839192", "#2E4053", "#A93226"],
            renderer,
            counter = 0;

        function submitRequest() {
            directionsService.route(requestArray[counter], directionResult);
        }

        function directionResult(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                renderer = new google.maps.DirectionsRenderer();
                renderer.setOptions({
                    preserveViewport: true,
                    suppressInfoWindows: true,
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                        strokeColor: colorArray[counter % 8]
                    }
                });
                renderer.setMap(map);
                renderer.setDirections(result);
                nextRequest();
            }
        }

        function nextRequest() {
            counter++;
            if (counter >= requestArray.length) {
                return;
            }
            submitRequest();
        }

        submitRequest();
    };

    $scope.generateRoute = function () {
        var nodeData = $scope.nodeData,
            centreIds = [],
            sensorIds = nodeData.filter(function (e) {
                return e.status == SENSOR_STATUSES.abnormal;
            })
            .map(
                function (e) {
                    return e.id;
                }
            ),
            selectedCentres = [],
            selectedSensors = nodeData.filter(function (e) {
                return e.status == SENSOR_STATUSES.abnormal;
            }),
            distance,
            minDistance = 10000000000000000,
            minCentreIndex = -1,
            i,
            j;

        for (i = 0; i < nodeData.length; i++) {
            if (nodeData[i].category == MAP_CATEGORIES.centre) {
                for (j = 0; j < selectedSensors.length; j++) {
                    distance = $scope.computeDitance(nodeData[i].latitude, nodeData[i].longitude, selectedSensors[j].latitude, selectedSensors[j].longitude);
                    if (minDistance > distance) {
                        minDistance = distance;
                        minCentreIndex = i;
                    }
                }
            }
        }

        centreIds.push(nodeData[minCentreIndex].id);
        selectedCentres.push(nodeData[minCentreIndex]);

        $sessionStorage.routeData = {
            data: {
                centreIds: centreIds,
                sensorIds: sensorIds,
                customCentres: []
            },
            selectedCentres: selectedCentres,
            selectedSensors: selectedSensors,
            currentRouteStep: 3
        };

        $('#promptModal').modal('hide');

        $timeout(function () {
            $location.url('/route/step-1');
        }, 400);
    };

    $scope.computeDitance = function (lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLon = (lon2 - lon1) * (Math.PI / 180);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    };

    $scope.moveTo = function (lat, lng) {
        map.panTo({
            lat: lat,
            lng: lng
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        var coordinate = null;
        if ($sessionStorage.routeData) {
            map = new google.maps.Map(document.getElementById('map'), $sessionStorage.routeData.coordinate);
            $scope.generateRequests($sessionStorage.routeData.data);
            $scope.routeMode = true;
            delete $sessionStorage.routeData;
        } else {
            if ($sessionStorage.nodeData) {
                coordinate = $sessionStorage.nodeData.coordinate;
                delete $sessionStorage.nodeData;
            } else {
                coordinate = {
                    center: {
                        lat: 21.1654031,
                        lng: 72.7833882
                    },
                    zoom: 16,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                };
            }
            map = new google.maps.Map(document.getElementById('map'), coordinate);
        }
        $scope.getNodes();
    });
});