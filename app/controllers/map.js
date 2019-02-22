var app = angular.module('sensorApp');

app.controller('MapController', function ($scope, $location, $filter, $mdSidenav, MAP_CATEGORIES, MAP_CENTRES, MAP_ROUTES, STATUS_CODES, SIDEBAR_DATA, SIDEBAR_MODES, PLOT_CODES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.tableData = [];

    $scope.mapData = {};

    $scope.markerData = {};

    $scope.routeData = {
        emergency: [],
        custom: []
    }

    $scope.statusCountData = {};

    $scope.sidebarActiveData = {
        title: '',
        mode: 0,
        nodeId: 'l001',
        nodeItem: {}
    }

    $scope.chartData = {};
    $scope.chartDialogVisible = false;

    $scope.mapLoaded = false;

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

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
                        $scope.updateMap(data.updatedNodeIds);
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

    $scope.updateMap = function (updatedNodeIds) {
        var statusCountData = {},
            routeGenerationRequired = false,
            nodeItem,
            oldStatusId,
            newStatusId,
            i;

        for (i = 0; i < updatedNodeIds.length; i++) {
            nodeItem = DataService.getNodeItem(updatedNodeIds[i]);

            oldStatusId = $scope.markerData[nodeItem.id].statusId;

            newStatusId = nodeItem.status.id;

            if ($scope.sidebarActiveData.mode == SIDEBAR_MODES.markerInformation) {
                if ($scope.sidebarActiveData.nodeItem.id == nodeItem.id) {
                    $scope.$parent.safeApply(function () {
                        $scope.sidebarActiveData.nodeItem = nodeItem;
                    });

                    if (nodeItem.category.id == 'c003') {
                        if ($scope.chartDialogVisible) {
                            $scope.chartData.data.datasets[0].data.push({
                                x: new Date(),
                                y: nodeItem.value
                            });

                            $scope.chartData.update();
                        }
                    }
                }

                if ($scope.sidebarActiveData.nodeItem.id == nodeItem.parentId) {
                    $scope.$parent.safeApply(function () {
                        $scope.tableData = DataService.getNodeChildren(nodeItem.id);
                    });
                }
            }

            if (oldStatusId != newStatusId) {
                statusCountData[oldStatusId] = (statusCountData[oldStatusId]) ? statusCountData[oldStatusId] - 1 : -1;
                statusCountData[newStatusId] = (statusCountData[newStatusId]) ? statusCountData[newStatusId] + 1 : +1;

                $scope.markerData[nodeItem.id].setIcon({
                    labelOrigin: new google.maps.Point(15, -8),
                    url: nodeItem.icon,
                    scaledSize: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 0)
                });

                if (nodeItem.category.id == 'c003') {
                    if (nodeItem.coordinates.dynamic) {
                        $scope.markerData[nodeItem.id].setPosition({
                            lat: nodeItem.coordinates.lat,
                            lng: nodeItem.coordinates.lng
                        });
                    }

                    routeGenerationRequired = true;
                }

                $scope.markerData[nodeItem.id].statusId = newStatusId;
            }
        }

        if (routeGenerationRequired) {
            var emergencyRouteData = RouteService.getEmergencyRouteData(),
                routeData = $scope.routeData,
                j;

            for (j = 0; j < routeData.emergency.length; j++) {
                routeData.emergency[j].setMap(null);
            }

            routeData.emergency = [];

            if (emergencyRouteData.length > 0) {
                $scope.generateRouteRequests(emergencyRouteData);
                $scope.moveMapTo(emergencyRouteData[0].routeArray[0], false);
            }

            $scope.$parent.safeApply(function () {
                $scope.routeData.emergency = emergencyRouteData;
            });

            $scope.$parent.showDialog('Error', "Sensor " + nodeItem.name + "'s status changed to " + nodeItem.status.name);
        }

        $scope.$parent.safeApply(function () {
            $scope.statusCountData = statusCountData;
        });
    };

    $scope.createMap = function () {
        var nodeData = DataService.getNodeData(),
            statusCountData = {},
            counter = 0;

        function plotMarkers() {
            if (nodeData[counter].display) {
                var marker = new google.maps.Marker({
                    id: nodeData[counter].id,
                    statusId: nodeData[counter].status.id,
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
                    map: $scope.mapData
                });

                google.maps.event.addListener(marker, 'click', (function (marker, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.sidebarActiveData.nodeId = marker.id;
                            scope.openSidebar('sd005');
                        });
                    };
                })(marker, $scope));

                $scope.markerData[nodeData[counter].id] = marker;

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

                        polygon.setMap($scope.mapData);
                    }
                }

                statusCountData[nodeData[counter].status.id] = (statusCountData[nodeData[counter].status.id]) ? statusCountData[nodeData[counter].status.id] + 1 : +1;
            }

            nextPlot();
        }

        function nextPlot() {
            counter++;

            if (counter >= nodeData.length) {
                var emergencyRouteData = RouteService.getEmergencyRouteData();

                if (emergencyRouteData.length > 0) {
                    $scope.generateRouteRequests(emergencyRouteData);
                    $scope.routeData.emergency = emergencyRouteData;
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

                            $scope.routeData.custom = customRouteData;
                            break;
                    }
                } else {
                    if (emergencyRouteData.length > 0) {
                        $scope.moveMapTo(emergencyRouteData[0].routeArray[0], false);
                    }
                }

                var markerCluster = new MarkerClusterer($scope.mapData, $scope.markerData, { imagePath: '../assets/img/clusterer/' });

                $scope.statusCountData = statusCountData;

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
                    map: $scope.mapData
                });

                google.maps.event.addListener(marker, 'click', (function (marker, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.sidebarActiveData.nodeId = marker.id;
                            scope.openSidebar('sd005');
                        });
                    };
                })(marker, $scope));

                $scope.markerData[routes[i].routeArray[0].id] = marker;
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

                renderer.setMap($scope.mapData);
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
            $scope.mapData.setZoom(nodeItem.zoom);

            $scope.mapData.panTo({
                lat: nodeItem.coordinates.lat,
                lng: nodeItem.coordinates.lng
            });
        }

        if (trigger) {
            google.maps.event.trigger($scope.markerData[nodeItem.id], 'click');
        }
    };

    $scope.openSidebar = function (charmBarId) {
        $scope.sidebarActiveData.mode = SIDEBAR_DATA[charmBarId].mode;

        switch ($scope.sidebarActiveData.mode) {
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
                $scope.setNodeItem();
                break;
        }

        $scope.sidebarActiveData.title = SIDEBAR_DATA[charmBarId].title;

        $mdSidenav("map-sidebar").open();
    };

    $scope.closeSidebar = function () {
        $scope.sidebarActiveData.mode = 0;

        $mdSidenav("map-sidebar").close();
    };

    $scope.setNodeItem = function () {
        var nodeId = $scope.sidebarActiveData.nodeId;

        $scope.sidebarActiveData.nodeItem = DataService.getNodeItem(nodeId);
        $scope.tableData = DataService.getNodeChildren(nodeId);
    };

    $scope.setParentNodeItem = function () {
        var item = DataService.getNodeItem($scope.sidebarActiveData.nodeItem.parentId);

        $scope.moveMapTo(item, true);
    };

    $scope.showChartDialog = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeChartData($scope.sensorId, $scope, SERVICE_EVENTS.chartData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.chartData.data.datasets[0].data = data.chartData
                    $scope.chartData.update();

                    $scope.$parent.safeApply(function () {
                        $scope.chartDialogVisible = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.showDialog('Error', data.message);

                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
            }
        });
    }

    $scope.hideChartDialog = function () {
        $scope.chartDialogVisible = false;
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


    $scope.showNodeItem = function () {
        var nodeId = $scope.sidebarActiveData.nodeItem.id,
            categoryId = $scope.sidebarActiveData.nodeItem.category.id,
            categoryName = '',
            link = '';

        switch (categoryId) {
            case 'c001':
                categoryName = MAP_CATEGORIES.c001.name;
                link = $scope.$parent.pageData.pd007.route;
                break;
            case 'c002':
                categoryName = MAP_CATEGORIES.c002.name;
                link = $scope.$parent.pageData.pd008.route;
                break;
            case 'c003':
                categoryName = MAP_CATEGORIES.c003.name;
                link = $scope.$parent.pageData.pd009.route;
                break;
        }

        categoryName = categoryName.toLowerCase();

        link += '?' + categoryName + '_id=' + nodeId;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.mapData = new google.maps.Map(document.querySelector(".map-container-1"), {
            center: {
                lat: 21.170240,
                lng: 72.831062
            },
            zoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        $scope.chartData = new Chart(document.querySelector(".chart-canvas").getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{
                    data: [],
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
                            return tooltipItems.yLabel + ' ' + $scope.sensorItem.reading.unit;
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
                            labelString: 'Reading'
                        }
                    }]
                }
            }
        });

        $scope.getNodeData();
    });

});