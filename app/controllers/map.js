var app = angular.module('app');

app.controller('MapController', function ($scope, $location, $filter, $mdSidenav, MAP_CATEGORIES, MAP_CENTRES, STATUS_CODES, SIDEBAR_DATA, SIDEBAR_MODES, PLOT_CODES, MAP_GRAPHS, SERVICE_EVENTS, RouteService, DataService) {
    $scope.tableData = [];

    $scope.mapData = {};

    $scope.markerData = {};

    $scope.trackedSensorIds = [];

    $scope.routeData = {
        r001: [],
        r002: [],
        r003: []
    };

    $scope.graphData = {
        g001: [],
        g002: [],
        g003: [],
        g004: [],
        g005: [],
        g006: [],
        g007: []
    }

    $scope.selectedGraph = {
        id: "g001",
        name: "Emergency Route - Google Maps",
        color: "#ce352c",
        icon: "timeline"
    }

    $scope.statusCountData = {
        cst001: 0,
        cst002: 0,
        cst003: 0,
        lst001: 0,
        lst002: 0,
        lst003: 0,
        sst001: 0,
        sst002: 0,
        sst003: 0
    };

    $scope.sidebarActiveData = {
        title: '',
        mode: -1,
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

    $scope.mapGraphs = MAP_GRAPHS;

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
        var statusCountData = $scope.statusCountData,
            tableData = $scope.tableData,
            toastMessages = [],
            routeGenerationRequired = false,
            nodeItem,
            oldStatusId,
            newStatusId,
            nodeIndex,
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
            }

            if (nodeItem.coordinates.dynamic) {
                $scope.markerData[nodeItem.id].setPosition({
                    lat: nodeItem.coordinates.lat,
                    lng: nodeItem.coordinates.lng
                });
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

                $scope.markerData[nodeItem.id].statusId = newStatusId;

                nodeIndex = tableData.findIndex(
                    function (tableItem) {
                        return tableItem.id == updatedNodeIds[i];
                    }
                );

                if (nodeIndex > -1) {
                    tableData[nodeIndex] = nodeItem;
                }

                if (nodeItem.category.id == 'c003') {
                    routeGenerationRequired = true;
                }

                toastMessages.push(nodeItem.category.name + " " + nodeItem.name + "'s status changed to " + nodeItem.status.name + '.');
            }
        }

        if (routeGenerationRequired) {
            $scope.plotGraph('g002', true);
            $scope.plotGraph('g001', true);
        }

        if (toastMessages.length > 0) {
            $scope.$parent.showToast(toastMessages, 10000);
        }

        $scope.$parent.safeApply(function () {
            $scope.statusCountData = statusCountData;
        });
        $scope.$parent.safeApply(function () {
            $scope.tableData = tableData;
        });
    };

    $scope.createMap = function () {
        var nodeData = DataService.getNodeData(),
            statusCountData = $scope.statusCountData,
            routeGenerationRequired = false,
            counter = 0;

        function plotMarkers() {
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
                        scope.openSidebar('sd006');
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

            if (nodeData[counter].category.id == 'c003' && (nodeData[counter].status.id == 'sst002' || nodeData[counter].status.id == 'sst003')) {
                routeGenerationRequired = true;
            }

            statusCountData[nodeData[counter].status.id] = (statusCountData[nodeData[counter].status.id]) ? statusCountData[nodeData[counter].status.id] + 1 : 1;

            nextPlot();
        }

        function nextPlot() {
            counter++;

            if (counter >= nodeData.length) {
                if (routeGenerationRequired) {
                    $scope.plotGraph('g002', true);
                    $scope.plotGraph('g001', true);
                }

                if ('plot_code' in $location.search()) {
                    var plotCode = parseInt($location.search().plot_code, 10);

                    switch (plotCode) {
                        case PLOT_CODES.nodeItem:
                            var item = DataService.getNodeItem($location.search().node_id);

                            $scope.moveMapTo(item, true);
                            break;
                        case PLOT_CODES.route:
                            if (RouteService.getCustomRouteStep() == 3) {
                                if (routeGenerationRequired) {
                                    $scope.plotGraph('gxxx', true);
                                }

                                RouteService.setCustomCentreData([]);
                                RouteService.setCustomSensorData([]);
                                RouteService.setCustomRouteStep(1);
                            }
                            break;
                    }
                }

                var markerCluster = new MarkerClusterer($scope.mapData, $scope.markerData, {
                    imagePath: '../assets/img/clusterer/'
                });

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
                    lat: routes[i].path[0].coordinates.lat,
                    lng: routes[i].path[0].coordinates.lng
                },
                destination: {
                    lat: routes[i].path[routes[i].path.length - 1].coordinates.lat,
                    lng: routes[i].path[routes[i].path.length - 1].coordinates.lng
                },
                travelMode: 'DRIVING'
            };

            if (routes[i].path[0].type.id == MAP_CENTRES.ctxxx.id) {
                var marker = new google.maps.Marker({
                    id: routes[i].path[0].id,
                    label: routes[i].path[0].name,
                    position: {
                        lat: routes[i].path[0].coordinates.lat,
                        lng: routes[i].path[0].coordinates.lng
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -8),
                        url: routes[i].path[0].icon,
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
                            scope.openSidebar('sd006');
                        });
                    };
                })(marker, $scope));

                $scope.markerData[routes[i].path[0].id] = marker;
            }

            if (routes[i].path.length > 2) {
                requestObject.waypoints = [];

                for (j = 1; j < routes[i].path.length - 1; j++) {
                    requestObject.waypoints.push({
                        location: {
                            lat: routes[i].path[j].coordinates.lat,
                            lng: routes[i].path[j].coordinates.lng
                        },
                        stopover: true
                    });
                }
            }

            requests.push(requestObject);
        }

        if (requests.length > 0) {
            $scope.processRouteRequests(requests, routes);
        }
    };

    $scope.processRouteRequests = function (requests, routes) {
        var directionsService = new google.maps.DirectionsService(),
            graphData = $scope.graphData,
            selectedGraphId = $scope.selectedGraph.id,
            mapData = $scope.mapData,
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
                        strokeColor: routes[counter].info.type.color
                    }
                });

                renderer.setDirections(result);

                renderer.setMap(mapData);

                graphData[selectedGraphId].push(renderer);

                nextRequest();
            }
        }

        function nextRequest() {
            counter++;

            if (counter >= requests.length) {
                if (routes[0].info.type.id == 'r001' || routes[0].info.type.id == 'rxxx') {
                    $scope.fitMapBoundsTo(routes[0]);
                }

                return;
            }

            submitRequest();
        }

        submitRequest();
    };

    $scope.fitMapBoundsTo = function (route) {
        var mapData = $scope.mapData,
            markerData = $scope.markerData,
            bounds = new google.maps.LatLngBounds(),
            i;

        for (i = 0; i < route.path.length; i++) {
            bounds.extend(markerData[route.path[i].id].getPosition());
        }

        mapData.setCenter(bounds.getCenter());
        mapData.fitBounds(bounds);
    }

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

    $scope.openSidebar = function (sidebarDataId) {
        var trackedSensorIds = $scope.trackedSensorIds,
            tableData = [],
            nodeItem,
            i;

        $scope.$parent.safeApply(function () {
            $scope.sidebarActiveData.mode = SIDEBAR_DATA[sidebarDataId].mode;
        });

        switch ($scope.sidebarActiveData.mode) {
            case SIDEBAR_MODES.markerList:
                if (SIDEBAR_DATA[sidebarDataId].filter1) {
                    $scope.filter1 = SIDEBAR_DATA[sidebarDataId].filter1;
                }

                if (SIDEBAR_DATA[sidebarDataId].filter2) {
                    $scope.filter2 = SIDEBAR_DATA[sidebarDataId].filter2;
                }

                $scope.applyFilter();
                break;
            case SIDEBAR_MODES.markerInformation:
                $scope.setNodeItem();
                break;
            case SIDEBAR_MODES.trackedSensorList:
                for (i = 0; i < trackedSensorIds.length; i++) {
                    nodeItem = DataService.getNodeItem(trackedSensorIds[i]);
                    tableData.push(nodeItem);
                }

                $scope.$parent.safeApply(function () {
                    $scope.tableData = tableData;
                });
                break;
            case SIDEBAR_MODES.emergencyRouteList:
                $scope.plotGraph('g001', false);
                break;
            case SIDEBAR_MODES.hospitalRouteList:
                $scope.plotGraph('g002', false);
                break;
        }

        $scope.sidebarActiveData.title = SIDEBAR_DATA[sidebarDataId].title;

        $mdSidenav("map-sidebar").open();
    };

    $scope.closeSidebar = function () {
        $scope.sidebarActiveData.mode = -1;

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

        DataService.subscribeChartData($scope.sidebarActiveData.nodeItem.id, $scope, SERVICE_EVENTS.chartData, function (event, data) {
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
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });

                    $scope.$parent.showDialog('Error', data.message);
                    break;
            }
        });
    }

    $scope.hideChartDialog = function () {
        $scope.chartDialogVisible = false;
    };

    $scope.plotGraph = function (newGraphId, forceUpdation) {
        var mapData = $scope.mapData,
            graphData = $scope.graphData,
            oldGraphId = $scope.selectedGraph.id,
            disasterReliefRouteData,
            medicalReliefRouteData,
            customRouteData,
            coordinateData = [],
            i,
            j;

        for (i = 0; i < graphData[oldGraphId].length; i++) {
            graphData[oldGraphId][i].setMap(null);
        }

        $scope.selectedGraph = MAP_GRAPHS[newGraphId];

        if (forceUpdation == true || graphData[newGraphId].length == 0) {
            switch (newGraphId) {
                case 'g001':
                    disasterReliefRouteData = RouteService.getDisasterReliefRouteData();

                    if (disasterReliefRouteData.length > 0) {
                        $scope.generateRouteRequests(disasterReliefRouteData);
                    }

                    $scope.routeData.r001 = disasterReliefRouteData;
                    break;
                case 'g002':
                    disasterReliefRouteData = RouteService.getDisasterReliefRouteData();

                    if (disasterReliefRouteData.length > 0) {
                        for (i = 0; i < disasterReliefRouteData.length; i++) {
                            coordinateData = [];

                            for (j = 0; j < disasterReliefRouteData[i].path.length; j++) {
                                coordinateData.push({
                                    lat: disasterReliefRouteData[i].path[j].coordinates.lat,
                                    lng: disasterReliefRouteData[i].path[j].coordinates.lng
                                });
                            }

                            var polyline = new google.maps.Polyline({
                                path: coordinateData,
                                geodesic: true,
                                strokeColor: MAP_GRAPHS.g003.color,
                                strokeWeight: 4,
                                strokeOpacity: 0.8,
                                map: mapData
                            });

                            graphData.g002.push(polyline);
                        }
                    }

                    $scope.routeData.r001 = disasterReliefRouteData;
                    break;

                case 'g003':
                    medicalReliefRouteData = RouteService.getMedicalReliefRouteData();

                    if (medicalReliefRouteData.length > 0) {
                        $scope.generateRouteRequests(medicalReliefRouteData);
                    }

                    $scope.routeData.r002 = medicalReliefRouteData;
                    break;
                case 'g004':
                    medicalReliefRouteData = RouteService.getMedicalReliefRouteData();

                    if (medicalReliefRouteData.length > 0) {
                        for (i = 0; i < medicalReliefRouteData.length; i++) {
                            coordinateData = [];

                            for (j = 0; j < medicalReliefRouteData[i].path.length; j++) {
                                coordinateData.push({
                                    lat: medicalReliefRouteData[i].path[j].coordinates.lat,
                                    lng: medicalReliefRouteData[i].path[j].coordinates.lng
                                });
                            }

                            var polyline = new google.maps.Polyline({
                                path: coordinateData,
                                geodesic: true,
                                strokeColor: MAP_GRAPHS.g004.color,
                                strokeWeight: 4,
                                strokeOpacity: 0.8,
                                map: mapData
                            });

                            graphData.g002.push(polyline);
                        }
                    }

                    $scope.routeData.r002 = medicalReliefRouteData;
                    break;
                case 'g005':

                    break;
                case 'g006':

                    break;
                case 'g007':
                    customRouteData = RouteService.getCustomRouteData();

                    if (customRouteData.length > 0) {
                        $scope.generateRouteRequests(customRouteData);
                    }

                    $scope.routeData.rxxx = customRouteData;
                    break;
            }
        } else {
            for (i = 0; i < graphData[newGraphId].length; i++) {
                graphData[newGraphId][i].setMap(mapData);
            }
        }
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
                category: {
                    id: $scope.filter1
                }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                status: {
                    id: $scope.filter2
                }
            }, true);
        }

        $scope.tableData = nodeData;
    };

    $scope.appendTrackedSensorId = function () {
        var sensorId = $scope.sidebarActiveData.nodeItem.id;

        $scope.$parent.safeApply(function () {
            $scope.trackedSensorIds.push(sensorId);
        });
    };

    $scope.removeTrackedSensorId = function () {
        var sensorId = $scope.sidebarActiveData.nodeItem.id;

        $scope.$parent.safeApply(function () {
            $scope.trackedSensorIds.splice($scope.trackedSensorIds.indexOf(sensorId), 1);
        });
    };

    $scope.isSensorTracked = function () {
        var sensorId = $scope.sidebarActiveData.nodeItem.id;

        return $scope.trackedSensorIds.includes(sensorId);
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
                            return tooltipItems.yLabel + ' ' + $scope.sidebarActiveData.nodeItem.reading.unit;
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