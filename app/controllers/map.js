var app = angular.module('sensorApp');
var map,
    markerObject = {},
    routeObject = {
        emergency: [],
        custom: []
    };

app.controller('MapCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, MAP_CENTRES, SENSOR_STATUSES, MAP_ROUTES, STATUS_CODES, CHARMS_BAR_CODES, ACTION_CODES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.nodeData = [];
    $scope.tableData = [];

    $scope.emergencyRouteData = [];
    $scope.emergencyRouteMode = false;

    $scope.customRouteData = [];
    $scope.customRouteMode = false;

    $scope.search = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.failedSensorCount = 0;
    $scope.abnormalSensorCount = 0;

    $scope.charmBarTitle = '';

    $scope.mapLoaded = false;

    $scope.getNodeDataAsArray = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeValueData($scope, SERVICE_EVENTS.valueDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
                        switch (data.changeCode) {
                            case STATUS_CODES.dataLoaded:
                                $scope.$parent.safeApply(function () {
                                    $scope.nodeData = DataService.getNodeDataAsArray();
                                    $scope.createMap();
                                    $scope.$parent.hideLoadingOverlay();
                                });
                                break;
                            case STATUS_CODES.dataUpdated:
                                if ($scope.mapLoaded) {
                                    $scope.nodeData = DataService.getNodeDataAsArray();
                                    $scope.updateMap(data.nodeItem);
                                }
                                break;
                        }
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if ($scope.mapLoaded) {
                        if ('latitude' in data.valueItem && 'longitude' in data.valueItem) {
                            var latlng = new google.maps.LatLng(data.valueItem.latitude, data.valueItem.longitude);
                            markerObject[data.valueItem.id].setPosition(latlng);
                        };

                        if ('address' in data.valueItem) {
                            $("#info-window-" + data.valueItem.id + " .address").eq(0).html(data.valueItem.address)
                        };

                        $("#info-window-" + data.valueItem.id + " .content").eq(0).html(data.valueItem.value + ' ' + data.valueItem.unit)
                    }
                    break;

            }
        });
    };

    $scope.updateMap = function (nodeItem) {
        var emergencyRouteData = RouteService.getEmergencyRouteData(),
            i;

        markerObject[nodeItem.id].setIcon({
            labelOrigin: new google.maps.Point(15, -5),
            url: nodeItem.icon
        });


        for (i = 0; i < routeObject.emergency.length; i++) {
            routeObject.emergency[i].setMap(null);
        }

        routeObject.emergency = [];

        if (emergencyRouteData.length > 0) {
            $scope.generateRouteRequests(emergencyRouteData);
            $scope.moveMapTo(emergencyRouteData[0].routeArray[0]);
        }

        $scope.emergencyRouteData = emergencyRouteData;

        $scope.failedSensorCount = DataService.getFailedSensorCount();
        $scope.abnormalSensorCount = DataService.getAbnormalSensorCount();
    };

    $scope.createMap = function () {
        var nodeData = $scope.nodeData,
            counter = 0,
            i;

        function plotMarkers() {
            if (nodeData[counter].display) {
                var object = {
                    label: nodeData[counter].name,
                    icon: {
                        labelOrigin: new google.maps.Point(15, -5),
                        url: nodeData[counter].icon
                    },
                    map: map
                };

                if ('latitude' in nodeData[counter] && 'longitude' in nodeData[counter]) {
                    object.position = {
                        lat: nodeData[counter].latitude,
                        lng: nodeData[counter].longitude
                    }
                } else {
                    var item = DataService.getValueItem(nodeData[counter].id);

                    object.position = {
                        lat: item.latitude,
                        lng: item.longitude
                    }
                }

                var marker = new google.maps.Marker(object);
                var content = $scope.generateContent(nodeData[counter]);

                marker.infoWindow = new google.maps.InfoWindow({
                    maxWidth: 200,
                    content: content
                });

                marker.addListener('click', function () {
                    marker.infoWindow.open(map, this);
                });

                markerObject[nodeData[counter].id] = marker;

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
                        case ACTION_CODES.showNodeItemOnMap:
                            var item = DataService.getNodeItem($location.search().node_id);

                            if (item) {
                                $scope.moveMapTo(item);
                            }

                            break;
                        case ACTION_CODES.showRouteOnMap:
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

                $scope.failedSensorCount = DataService.getFailedSensorCount();
                $scope.abnormalSensorCount = DataService.getAbnormalSensorCount();

                $scope.mapLoaded = true;

                return;
            }

            plotMarkers();
        }

        plotMarkers();
    };

    $scope.generateContent = function (nodeItem) {
        var content = '',
            item;

        content += '<div class="map-info-window" id="info-window-' + nodeItem.id + '">';
        content += '<div class="name">' + nodeItem.name + '</h5>';
        content += '<div class="type">' + nodeItem.type + '</div>';

        if (nodeItem.category == MAP_CATEGORIES.sensor) {
            item = DataService.getValueItem(nodeItem.id);
            content += '<div class="content">' + item.value + ' ' + item.unit + '</div>';
        }

        if ('address' in nodeItem) {
            content += '<div class="address">' + nodeItem.address + '</div>';
        } else {
            item = DataService.getValueItem(nodeItem.id);
            content += '<div class="address">' + item.address + '</div>';
        }

        content += '</div>';

        return content;
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

            if (routeData[i].routeArray[0].type == MAP_CENTRES.customCentre.name) {
                var marker = new google.maps.Marker({
                    label: routeData[i].routeArray[0].name,
                    position: {
                        lat: routeData[i].routeArray[0].latitude,
                        lng: routeData[i].routeArray[0].longitude
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -5),
                        url: routeData[i].routeArray[0].icon
                    },
                    map: map
                });

                var content = $scope.generateContent(routeData[i].routeArray[0]);

                marker.infoWindow = new google.maps.InfoWindow({
                    maxWidth: 200,
                    content: content
                });

                marker.addListener('click', function () {
                    marker.infoWindow.open(map, this);
                });

                markerObject[routeData[i].routeArray[0].id] = marker;
            }

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
                        strokeColor: colorArray[counter % colorArray.length]
                    }
                });

                renderer.setMap(map);
                renderer.setDirections(nodeData);

                if (routeData[counter].routeInfo.routeType == MAP_ROUTES.emergency) {
                    routeObject.emergency.push(renderer);
                }

                if (routeData[counter].routeInfo.routeType == MAP_ROUTES.custom) {
                    routeObject.custom.push(renderer);
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

        google.maps.event.trigger(markerObject[item.id], 'click');
    };

    $scope.openCharmsBar = function (openCode) {
        switch (openCode) {
            case CHARMS_BAR_CODES.centres:
                $scope.filter1 = MAP_CATEGORIES.centre;
                $scope.charmBarTitle = 'Centres';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case CHARMS_BAR_CODES.locations:
                $scope.filter1 = MAP_CATEGORIES.location;
                $scope.charmBarTitle = 'Locations';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case CHARMS_BAR_CODES.normalSensors:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.normal;
                $scope.charmBarTitle = 'Normal Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case CHARMS_BAR_CODES.failedSensors:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.failure;
                $scope.charmBarTitle = 'Failed Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case CHARMS_BAR_CODES.abnormalSensors:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.abnormal;
                $scope.charmBarTitle = 'Abnormal Sensors';
                $scope.emergencyRouteMode = false;
                $scope.customRouteMode = false;
                break;
            case CHARMS_BAR_CODES.emergencyRoutes:
                $scope.charmBarTitle = 'Emergency Routes';
                $scope.emergencyRouteMode = true;
                break;
            case CHARMS_BAR_CODES.customRoutes:
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

        $scope.getNodeDataAsArray();
    });

});