var app = angular.module('sensorApp');
var map,
    markerData = {},
    routeData = {
        emergency: [],
        custom: []
    },
    chart = null;

app.controller('MapController', function ($scope, $location, $filter, $mdSidenav, MAP_CATEGORIES, MAP_CENTRES, SENSOR_STATUSES, MAP_ROUTES, STATUS_CODES, SIDEBAR_DATA, SIDEBAR_MODES, PLOT_CODES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.tableData = [];

    $scope.emergencyRouteData = [];
    $scope.customRouteData = [];

    $scope.charmBarTitle = '';
    $scope.charmBarMode = 0;
    $scope.charmBarNodeId = 'l001';
    $scope.charmBarNodeItem = {};

    $scope.sensorCount1 = 0;
    $scope.sensorCount2 = 0;

    $scope.mapLoaded = false;

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.mapCategories = MAP_CATEGORIES;
    $scope.sidebarData = SIDEBAR_DATA;
    $scope.sidebarModes = SIDEBAR_MODES;

    $scope.getNodeData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.createMap();
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    if ($scope.mapLoaded) {
                        $scope.updateMap(data.nodeItem, data.sensorStatusChanged);
                    }
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });

                    $scope.$parent.showDialog('Error', data.message);
                    break;
                case STATUS_CODES.dataUpdateFailed:
                    $scope.$parent.showDialog('Error', data.message);
                    break;
            }
        });
    };

    $scope.updateMap = function (nodeItem, sensorStatusChanged) {
        if (nodeItem.category.id == MAP_CATEGORIES.c003.id) {

            if ($scope.charmBarMode == SIDEBAR_MODES.markerInformation) {
                if ($scope.charmBarNodeItem.id == nodeItem.id) {
                    $scope.$parent.safeApply(function () {
                        $scope.charmBarNodeItem = nodeItem;
                    });

                    if ($mdDialog.isOpen()) {
                        chart.data.datasets[0].data.push({
                            x: new Date(),
                            y: nodeItem.value
                        });

                        chart.update();
                    }
                }

                if ($scope.charmBarNodeItem.id == nodeItem.parentId) {
                    $scope.$parent.safeApply(function () {
                        $scope.tableData = DataService.getNodeChildren(nodeItem.id);
                    });
                }
            }

            if (nodeItem.dynamicCoordinates) {
                markerData[nodeItem.id].setPosition({
                    lat: nodeItem.coordinates.lat,
                    lng: nodeItem.coordinates.lng
                });
            }

            if (sensorStatusChanged) {
                var emergencyRouteData = RouteService.getEmergencyRouteData(),
                    sensorCount1 = DataService.getSevereSensorCount(),
                    sensorCount2 = DataService.getExtremeSensorCount(),
                    i;

                markerData[nodeItem.id].setIcon({
                    labelOrigin: new google.maps.Point(15, -8),
                    url: nodeItem.icon,
                    scaledSize: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 0)
                });

                for (i = 0; i < routeData.emergency.length; i++) {
                    routeData.emergency[i].setMap(null);
                }

                routeData.emergency = [];

                if (emergencyRouteData.length > 0) {
                    $scope.generateRouteRequests(emergencyRouteData);
                    $scope.moveMapTo(emergencyRouteData[0].routeArray[0], false);
                }

                $scope.$parent.safeApply(function () {
                    $scope.emergencyRouteData = emergencyRouteData;
                    $scope.sensorCount1 = sensorCount1;
                    $scope.sensorCount2 = sensorCount2;
                });

                switch (nodeItem.status) {
                    case SENSOR_STATUSES.sst002.name:
                        $scope.$parent.showDialog('Error', data.message).notify.create("Sensor " + nodeItem.name + " failed.", "Alert", {
                            cls: "warning"
                        });
                        break;
                    case SENSOR_STATUSES.sst003.name:
                        $scope.$parent.showDialog('Error', data.message).notify.create("Sensor " + nodeItem.name + " is behaving abnormally.", "Alert", {
                            cls: "alert"
                        });
                        break;
                }
            }
        }
    };

    $scope.createMap = function () {
        var nodeData = DataService.getNodeData(),
            counter = 0;

        function plotMarkers() {
            if (nodeData[counter].display) {
                var marker = new google.maps.Marker({
                    id: nodeData[counter].id,
                    label: nodeData[counter].name,
                    position: {
                        lat: nodeData[counter].coordinates.lat,
                        lng: nodeData[counter].coordinates.lng
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -8),
                        url: nodeData[counter].icon,
                        scaledSize: new google.maps.Size(32, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    map: map
                });

                google.maps.event.addListener(marker, 'click', (function (marker, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.charmBarNodeId = marker.id;
                            scope.openSidebar('sd005');
                        });
                    };
                })(marker, $scope));

                markerData[nodeData[counter].id] = marker;

                if (nodeData[counter].boundary) {
                    var polygon,
                        i;

                    for (i = 0; i < nodeData[counter].boundary.bounds.length; i++) {
                        polygon = new google.maps.Polygon({
                            paths: nodeData[counter].boundary.bounds[i],
                            strokeColor: nodeData[counter].color,
                            strokeOpacity: 0.3,
                            strokeWeight: 2,
                            fillColor: nodeData[counter].boundary.color,
                            fillOpacity: 0.1,
                        });

                        polygon.setMap(map);
                    }
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

                if ('plot_code' in $location.search()) {
                    var plotCode = parseInt($location.search().plot_code, 10);

                    switch (plotCode) {
                        case PLOT_CODES.nodeItem:
                            var item = DataService.getNodeItem($location.search().node_id);

                            $scope.moveMapTo(item, true);
                            break;
                        case PLOT_CODES.route:
                            var customRouteData = [];

                            if (RouteService.getCustomRouteStep() == 3) {
                                customRouteData = RouteService.getCustomRouteData();

                                $scope.generateRouteRequests(customRouteData);

                                $scope.moveMapTo(customRouteData[0].routeArray[0], false);

                                RouteService.setCustomCentreData([]);
                                RouteService.setCustomSensorData([]);
                                RouteService.setCustomRouteStep(1);
                            }

                            $scope.customRouteData = customRouteData;
                            break;
                    }
                } else {
                    if (emergencyRouteData.length > 0) {
                        $scope.moveMapTo(emergencyRouteData[0].routeArray[0], false);
                    }
                }

                var markerCluster = new MarkerClusterer(map, markerData, { imagePath: '../assets/img/clusterer/' });

                $scope.sensorCount1 = DataService.getSevereSensorCount();
                $scope.sensorCount2 = DataService.getExtremeSensorCount();

                $scope.mapLoaded = true;

                return;
            }

            plotMarkers();
        }

        plotMarkers();
    };

    $scope.generateRouteRequests = function (routes) {
        var requests = [],
            requestObject,
            i,
            j;

        for (i = 0; i < routes.length; i++) {
            requestObject = {
                origin: {
                    lat: routes[i].routeArray[0].coordinates.lat,
                    lng: routes[i].routeArray[0].coordinates.lng
                },
                destination: {
                    lat: routes[i].routeArray[routes[i].routeArray.length - 1].coordinates.lat,
                    lng: routes[i].routeArray[routes[i].routeArray.length - 1].coordinates.lng
                },
                travelMode: 'DRIVING'
            };

            if (routes[i].routeArray[0].type.name == MAP_CENTRES.ct006.name) {
                var marker = new google.maps.Marker({
                    id: routes[i].routeArray[0].id,
                    label: routes[i].routeArray[0].name,
                    position: {
                        lat: routes[i].routeArray[0].coordinates.lat,
                        lng: routes[i].routeArray[0].coordinates.lng
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -8),
                        url: routes[i].routeArray[0].icon,
                        scaledSize: new google.maps.Size(32, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    map: map
                });

                google.maps.event.addListener(marker, 'click', (function (marker, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.charmBarNodeId = marker.id;
                            scope.openSidebar('sd005');
                        });
                    };
                })(marker, $scope));

                markerData[routes[i].routeArray[0].id] = marker;
            }

            if (routes[i].routeArray.length > 2) {
                requestObject.waypoints = [];

                for (j = 1; j < routes[i].routeArray.length - 1; j++) {
                    requestObject.waypoints.push({
                        location: {
                            lat: routes[i].routeArray[j].coordinates.lat,
                            lng: routes[i].routeArray[j].coordinates.lng
                        },
                        stopover: true
                    });
                }
            }

            requests.push(requestObject);
        }

        $scope.processRouteRequests(requests, routes);
    };

    $scope.processRouteRequests = function (requests, routes) {
        var directionsService = new google.maps.DirectionsService(),
            colors = ["#2471A3", "#17A589", "#229954", "#D4AC0D", "#CA6F1E", "#839192", "#2E4053", "#A93226"],
            counter = 0;

        function submitRequest() {
            directionsService.route(requests[counter], directionCallback);
        }

        function directionCallback(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var renderer = new google.maps.DirectionsRenderer();

                renderer.setOptions({
                    preserveViewport: true,
                    suppressInfoWindows: true,
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                        strokeColor: colors[counter % colors.length]
                    }
                });

                renderer.setMap(map);
                renderer.setDirections(result);

                if (routes[counter].routeInfo.routeType == MAP_ROUTES.emergency) {
                    routeData.emergency.push(renderer);
                }

                if (routes[counter].routeInfo.routeType == MAP_ROUTES.custom) {
                    routeData.custom.push(renderer);
                }

                nextRequest();
            }
        }

        function nextRequest() {
            counter++;

            if (counter >= requests.length) {
                return;
            }

            submitRequest();
        }

        submitRequest();
    };

    $scope.moveMapTo = function (nodeItem, trigger) {
        if (nodeItem) {
            map.setZoom(nodeItem.zoom);

            map.panTo({
                lat: nodeItem.coordinates.lat,
                lng: nodeItem.coordinates.lng
            });
        }

        if (trigger) {
            google.maps.event.trigger(markerData[nodeItem.id], 'click');
        }
    };

    $scope.openSidebar = function (charmBarId) {
        $scope.charmBarMode = SIDEBAR_DATA[charmBarId].mode;

        switch ($scope.charmBarMode) {
            case SIDEBAR_MODES.markerList:
                if (SIDEBAR_DATA[charmBarId].filter1) {
                    $scope.filter1 = SIDEBAR_DATA[charmBarId].filter1;
                }
                if (SIDEBAR_DATA[charmBarId].filter2) {
                    $scope.filter2 = SIDEBAR_DATA[charmBarId].filter2;
                }
                $scope.applyFilter();
                break;
            case SIDEBAR_MODES.markerInformation:
                $scope.setCharmBarNodeInfo();
                break;
        }

        $scope.charmBarTitle = SIDEBAR_DATA[charmBarId].title;

        $mdSidenav("map-sidebar").open();
    };

    $scope.closeSidebar = function () {
        $scope.charmBarMode = 0;

        $mdSidenav("map-sidebar").close();
    };

    $scope.setCharmBarNodeInfo = function () {
        var nodeId = $scope.charmBarNodeId;

        $scope.charmBarNodeItem = DataService.getNodeItem(nodeId);
        $scope.tableData = DataService.getNodeChildren(nodeId);
    };

    $scope.setParentNodeInfo = function () {
        var item = DataService.getNodeItem($scope.charmBarNodeItem.parentId);

        $scope.moveMapTo(item, true);
    };

    $scope.applyFilter = function () {
        var nodeData = DataService.getNodeData();

        if ($scope.query) {
            nodeData = $filter('filter')(nodeData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                category: { id: $scope.filter1 }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                status: { id: $scope.filter2 }
            }, true);
        }

        $scope.tableData = nodeData;
    };

    $scope.showChartDialog = function (event) {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeChartData($scope.nodeId, $scope, SERVICE_EVENTS.chartData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    if (chart) {
                        chart.data.datasets[0].data = data.chartData
                        chart.update();
                    } else {
                        chart = new Chart(document.getElementById("chartCanvas").getContext('2d'), {
                            type: 'line',
                            data: {
                                datasets: [{
                                    data: data.chartData,
                                    borderColor: 'rgba(255,99,132,1)',
                                    fill: false,
                                    borderWidth: 2,
                                    pointRadius: 5,
                                    pointHoverRadius: 10
                                }]
                            },
                            options: {
                                legend: {
                                    display: false
                                },
                                tooltips: {
                                    callbacks: {
                                        label: function (tooltipItems, data) {
                                            return tooltipItems.yLabel + ' ' + $scope.nodeItem.reading.unit;
                                        }
                                    }
                                },
                                scales: {
                                    xAxes: [{
                                        type: 'time',
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Time'
                                        }
                                    }],
                                    yAxes: [{
                                        scaleLabel: {
                                            display: true,
                                            labelString: $scope.nodeItem.reading.unit
                                        }
                                    }]
                                }
                            }
                        });
                    }

                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();

                        $mdDialog.show({
                            contentElement: '#chartDialog',
                            parent: angular.element(document.body),
                            targetEvent: event,
                            clickOutsideToClose: true
                        });
                    });

                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    $scope.$parent.showDialog('Error', data.message);
                    break;
            }
        });
    }

    $scope.hideChartDialog = function () {
        $mdDialog.hide();
    };

    $scope.showNodeItem = function () {
        var nodeId = $scope.charmBarNodeItem.id,
            categoryId = $scope.charmBarNodeItem.category.id,
            categoryName = '',
            link = '';

        switch (categoryId) {
            case MAP_CATEGORIES.c001.id:
                categoryName = MAP_CATEGORIES.c001.name;
                link = $scope.$parent.pageData.pd007.route;
                break;
            case MAP_CATEGORIES.c002.id:
                categoryName = MAP_CATEGORIES.c002.name;
                link = $scope.$parent.pageData.pd008.route;
                break;
            case MAP_CATEGORIES.c003.id:
                categoryName = MAP_CATEGORIES.c003.name;
                link = $scope.$parent.pageData.pd009.route;
                break;
        }

        categoryName = categoryName.toLowerCase();

        link += '?' + categoryName + '_id=' + nodeId;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        map = new google.maps.Map(document.querySelector(".map-container-1"), {
            center: {
                lat: 21.170240,
                lng: 72.831062
            },
            zoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        $scope.getNodeData();
    });

});