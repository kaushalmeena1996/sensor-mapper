var app = angular.module('sensorApp');
var map,
    markerData = {};

app.controller('MapCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, MAP_CENTRES, SENSOR_STATUSES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.nodeData = [];
    $scope.tableData = [];

    $scope.routeList = [];

    $scope.search = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.sensorCountFailure = 0;
    $scope.sensorCountAbnormal = 0;

    $scope.charmBarTitle = '';

    $scope.mapLoaded = false;

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
            sensorCountFailure = 0,
            sensorCountAbnormal = 0,
            content,
            i;

        for (i = 0; i < nodeData.length; i++) {
            if (nodeData[i].category == MAP_CATEGORIES.sensor) {
                content = $scope.generateContent(nodeData[i]);

                if (nodeData[i].status == SENSOR_STATUSES.failure) {
                    sensorCountFailure += 1;
                }

                if (nodeData[i].status == SENSOR_STATUSES.abnormal) {
                    sensorCountAbnormal += 1;
                }

                markerData[nodeData[i].id].setIcon(nodeData[i].icon);

                markerData[nodeData[i].id].infoWindow.setContent(content);

                if ($scope.isInfoWindowOpen(markerData[nodeData[i].id].infoWindow)) {
                    markerData[nodeData[i].id].infoWindow.close();
                    markerData[nodeData[i].id].infoWindow.open(map, markerData[nodeData[i].id]);
                }
            }
        }

        $scope.sensorCountFailure = sensorCountFailure;
        $scope.sensorCountAbnormal = sensorCountAbnormal;
    };

    $scope.createMap = function () {
        var nodeData = $scope.nodeData,
            counter = 0,
            i;

        function plotMarker() {
            if (nodeData[counter].display) {

                var marker = new google.maps.Marker({
                    title: nodeData[counter].name,
                    position: {
                        lat: nodeData[counter].latitude,
                        lng: nodeData[counter].longitude
                    },
                    icon: nodeData[counter].icon,
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

                if (nodeData[counter].category == MAP_CATEGORIES.sensor) {
                    if (nodeData[counter].status == SENSOR_STATUSES.failure) {
                        $scope.sensorCountFailure += 1;
                    }

                    if (nodeData[counter].status == SENSOR_STATUSES.abnormal) {
                        $scope.sensorCountAbnormal += 1;
                    }
                }

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
                $scope.mapLoaded = true;

                if ('action_code' in $location.search()) {
                    switch ($location.search().action_code) {
                        case '1':
                            var item = DataService.getNodeDetail($location.search().node_id);

                            if (item) {
                                $scope.moveTo(item);
                            }

                            break;
                        case '2':
                            if (RouteService.getRouteStep() == 2) {
                                var routeData = RouteService.generateRoute();

                                $scope.generateRequests(routeData);

                                $scope.routeList.push(routeData);

                                $scope.moveTo(routeData[0][0]);

                                RouteService.setRouteStep(1);
                            }

                            break;
                    }
                }

                return;
            }

            plotMarker();
        }

        plotMarker();
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

    $scope.generateRequests = function (routeData) {
        var requestArray = [],
            requestObject,
            marker,
            i,
            j;

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
            directionsService.route(requestArray[counter], directionnodeData);
        }

        function directionnodeData(nodeData, status) {
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
                renderer.setDirections(nodeData);
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

    $scope.moveTo = function (item) {
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
                break;
            case 1:
                $scope.filter1 = MAP_CATEGORIES.location;
                $scope.charmBarTitle = 'Locations';
                break;
            case 2:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.normal;
                $scope.charmBarTitle = 'Normal Sensors';
                break;
            case 3:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.failure;
                $scope.charmBarTitle = 'Failed Sensors';
                break;
            case 4:
                $scope.filter1 = MAP_CATEGORIES.sensor;
                $scope.filter2 = SENSOR_STATUSES.abnormal;
                $scope.charmBarTitle = 'Abnormal Sensors';
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