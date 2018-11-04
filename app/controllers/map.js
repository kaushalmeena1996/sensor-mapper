var app = angular.module('sensorApp');
var map,
    markerData = {},
    rendererData = {
        emergency: [],
        custom: []
    };

app.controller('MapCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, SENSOR_STATUSES, MAP_ROUTES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.nodeData = [];
    $scope.tableData = [];

    $scope.emergencyRouteData = [];
    $scope.customRouteData = [];

    $scope.search = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.failureSensorCount = 0;
    $scope.abnormalSensorCount = 0;

    $scope.charmBarTitle = '';

    $scope.mapLoaded = false;

    $scope.emergencyRouteMode = false;

    $scope.customRouteMode = false;

    $scope.getNodeData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribe($scope, SERVICE_EVENTS.nodeDataChanged, function () {
            $scope.$parent.safeApply(function () {
                $scope.nodeData = DataService.getNodeData();

                if ($scope.mapLoaded) {
                    $scope.updateMap();
                } else {
                    $scope.createMap();
                }

                $scope.$parent.hideLoadingOverlay();
            });
        });
    };

    $scope.updateMap = function () {
        var nodeData = $scope.nodeData,
            emergencyRouteData = RouteService.getEmergencyRouteData(),
            content,
            i;

        for (i = 0; i < nodeData.length; i++) {
            if (nodeData[i].category == MAP_CATEGORIES.sensor) {
                content = $scope.generateContent(nodeData[i]);

                markerData[nodeData[i].id].setIcon(nodeData[i].icon);
                markerData[nodeData[i].id].infoWindow.setContent(content);

                if ($scope.isInfoWindowOpen(markerData[nodeData[i].id].infoWindow)) {
                    markerData[nodeData[i].id].infoWindow.close();
                    markerData[nodeData[i].id].infoWindow.open(map, markerData[nodeData[i].id]);
                }
            }
        }

        for (i = 0; i < rendererData.emergency.length; i++) {
            rendererData.emergency[i].setMap(null);
        }

        rendererData.emergency = [];

        if (emergencyRouteData.length > 0) {
            $scope.generateRouteRequests(emergencyRouteData);
            $scope.moveMapTo(emergencyRouteData[0].routeArray[0]);
        }

        $scope.emergencyRouteData = emergencyRouteData;

        $scope.failureSensorCount = DataService.getFailureSensorCount();
        $scope.abnormalSensorCount = DataService.getAbnormalSensorCount();
    };

    $scope.createMap = function () {
        var nodeData = $scope.nodeData,
            counter = 0,
            i;

        function plotMarkers() {
            if (nodeData[counter].display) {
                var marker = new google.maps.Marker({
                    label: nodeData[counter].name,
                    position: {
                        lat: nodeData[counter].latitude,
                        lng: nodeData[counter].longitude
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -5),
                        url: nodeData[counter].icon
                    },
                    map: map
                });

                content = $scope.generateContent(nodeData[counter]);

                marker.infoWindow = new google.maps.InfoWindow({
                    maxWidth: 200,
                    content: content
                });

                marker.addListener('click', function () {
                    marker.infoWindow.open(map, this);
                });

                markerData[nodeData[counter].id] = marker;

                if (nodeData[counter].bounds) {
                    var bounds = nodeData[counter].bounds.split(";"),
                        polygon,
                        paths = [];

                    for (i = 0; i < bounds.length; i++) {
                        paths.push({
                            lat: parseFloat(bounds[i].split(',')[0]),
                            lng: parseFloat(bounds[i].split(',')[1])
                        });
                    }

                    polygon = new google.maps.Polygon({
                        paths: paths,
                        strokeColor: nodeData[counter].color,
                        strokeOpacity: 0.3,
                        strokeWeight: 1,
                        fillColor: nodeData[counter].color,
                        fillOpacity: 0.2,
                    });

                    polygon.setMap(map);
                }
            }

            nextPlot();
        }

        function nextPlot() {
            counter++;

            if (counter >= nodeData.length) {
                var emergencyRouteData = RouteService.getEmergencyRouteData();

                if (emergencyRouteData.length > 0) {
                    $scope.generateRouteRequests(emergencyRouteData);
                    $scope.emergencyRouteData = emergencyRouteData;
                }

                if ('action_code' in $location.search()) {
                    switch ($location.search().action_code) {
                        case '1':
                            var item = DataService.getNodeDetail($location.search().node_id);

                            if (item) {
                                $scope.moveMapTo(item);
                            }

                            break;
                        case '2':
                            var customRouteData = [];

                            if (RouteService.getCustomRouteStep() == 3) {
                                customRouteData = RouteService.getCustomRouteData();

                                $scope.generateRouteRequests(customRouteData);

                                $scope.moveMapTo(customRouteData[0].routeArray[0]);

                                RouteService.setCustomCentreData([]);
                                RouteService.setCustomSensorData([]);
                                RouteService.setCustomRouteStep(1);
                            }

                            $scope.customRouteData = customRouteData;

                            break;
                    }
                } else {
                    if (emergencyRouteData.length > 0) {
                        $scope.moveMapTo(emergencyRouteData[0].routeArray[0]);
                    }
                }

                $scope.failureSensorCount = DataService.getFailureSensorCount();
                $scope.abnormalSensorCount = DataService.getAbnormalSensorCount();

                $scope.mapLoaded = true;

                return;
            }

            plotMarkers();
        }

        plotMarkers();
    };

    $scope.generateContent = function (node) {
        var content = '';

        content += '<div class="map-info-window">';
        content += '<div class="name">' + node.name + '</h5>';
        content += '<div class="type">' + node.type + '</div>';

        if (node.category == MAP_CATEGORIES.sensor) {
            content += '<div class="content">' + node.value + ' ' + node.unit + '</div>';
        }

        content += '<div class="address">' + node.address + '</div>';
        content += '</div>';

        return content;
    };

    $scope.isInfoWindowOpen = function (infoWindow) {
        var map = infoWindow.getMap();
        return (map !== null && typeof map !== "undefined");
    };

    $scope.generateRouteRequests = function (routeData) {
        var requestArray = [],
            requestObject,
            i,
            j;

        for (i = 0; i < routeData.length; i++) {
            requestObject = {
                origin: null,
                destination: null,
                travelMode: 'DRIVING'
            };

            requestObject.origin = {
                lat: routeData[i].routeArray[0].latitude,
                lng: routeData[i].routeArray[0].longitude
            };

            if (routeData[i].routeArray.length > 2) {
                requestObject.waypoints = [];
                for (j = 1; j < routeData[i].routeArray.length - 1; j++) {
                    requestObject.waypoints.push({
                        location: {
                            lat: routeData[i].routeArray[j].latitude,
                            lng: routeData[i].routeArray[j].longitude
                        },
                        stopover: true
                    });
                }
            }

            requestObject.destination = {
                lat: routeData[i].routeArray[routeData[i].routeArray.length - 1].latitude,
                lng: routeData[i].routeArray[routeData[i].routeArray.length - 1].longitude
            };

            requestArray.push(requestObject);
        }

        $scope.processRouteRequests(requestArray, routeData);
    };

    $scope.processRouteRequests = function (requestArray, routeData) {
        var directionsService = new google.maps.DirectionsService(),
            colorArray = ["#2471A3", "#17A589", "#229954", "#D4AC0D", "#CA6F1E", "#839192", "#2E4053", "#A93226"],
            counter = 0;

        function submitRequest() {
            directionsService.route(requestArray[counter], directionCallback);
        }

        function directionCallback(nodeData, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var renderer = new google.maps.DirectionsRenderer();
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
                renderer.setDirections(nodeData);

                if (routeData[counter].routeInfo.routeType == MAP_ROUTES.emergency) {
                    rendererData.emergency.push(renderer);
                }

                if (routeData[counter].routeInfo.routeType == MAP_ROUTES.custom) {
                    rendererData.custom.push(renderer);
                }

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

    $scope.moveMapTo = function (item) {
        map.panTo({
            lat: item.latitude,
            lng: item.longitude
        });

        google.maps.event.trigger(markerData[item.id], 'click');
    };

    $scope.openCharmsBar = function (actionCode) {
        switch (actionCode) {
            case 0:
                $scope.filter1 = MAP_CATEGORIES.centre;
                $scope.charmBarTitle = 'Centres';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case 1:
                $scope.filter1 = MAP_CATEGORIES.location;
                $scope.charmBarTitle = 'Locations';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case 2:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.normal;
                $scope.charmBarTitle = 'Normal Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case 3:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.failure;
                $scope.charmBarTitle = 'Failed Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case 4:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.abnormal;
                $scope.charmBarTitle = 'Abnormal Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case 5:
                $scope.charmBarTitle = 'Emergency Routes';
                $scope.emergencyRouteMode = true;
                break;
            case 6:
                $scope.charmBarTitle = 'Custom Routes';
                $scope.customRouteMode = true;
                break;
        }

        $scope.applyFilter();

        $('#charmsBar').data('charms').open();
    };

    $scope.closeCharmsBar = function () {
        $('#charmsBar').data('charms').close();
    };

    $scope.applyFilter = function () {
        var nodeData = $scope.nodeData;

        if ($scope.search) {
            nodeData = $filter('filter')(nodeData, {
                'name': $scope.search
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                'category': $scope.filter1
            }, true);
        }

        if ($scope.filter1 == MAP_CATEGORIES.sensor && $scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                'status': $scope.filter2
            }, true);
        }

        $scope.tableData = nodeData;
    };

    $scope.$on('$viewContentLoaded', function () {
        map = new google.maps.Map(document.getElementById('map1'), {
            center: {
                lat: 21.1654031,
                lng: 72.7833882
            },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        $scope.getNodeData();
    });

});