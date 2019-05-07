var app = angular.module('app');

app.controller('MapController', function ($scope, $location, $filter, $mdSidenav, MAP_CATEGORIES, MAP_CENTRES, STATUS_CODES, SIDEBAR_DATA, SIDEBAR_MODES, PLOT_CODES, MAP_GRAPHS, SERVICE_EVENTS, RouteService, DataService) {
    $scope.tableData = [];

    $scope.mapData1 = {};
    $scope.mapData2 = {};

    $scope.markerData1 = {};
    $scope.markerData2 = {};

    $scope.graphData1 = {
        g001: [],
        g002: [],
        g003: [],
        g004: [],
        g005: [],
        g006: [],
        g007: [],
        g008: [],
        g009: []
    }
    $scope.graphData2 = {
        g001: [],
        g002: [],
        g003: [],
        g004: [],
        g005: [],
        g006: [],
        g007: [],
        g008: [],
        g009: []
    }

    $scope.selectedGraph1 = MAP_GRAPHS.g001;
    $scope.selectedGraph2 = MAP_GRAPHS.g001;

    $scope.mapSplitted = false;

    $scope.trackedSensorIds = [];

    $scope.routeData = {
        r001: [],
        r002: [],
        r003: []
    };

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

    $scope.distanceMatrixData = {};
    $scope.distanceMatrixDialogVisible = false;

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

            oldStatusId = $scope.markerData1[nodeItem.id].statusId;

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
                //for map 1
                $scope.markerData1[nodeItem.id].setPosition({
                    lat: nodeItem.coordinates.lat,
                    lng: nodeItem.coordinates.lng
                });

                //for map 2
                $scope.markerData2[nodeItem.id].setPosition({
                    lat: nodeItem.coordinates.lat,
                    lng: nodeItem.coordinates.lng
                });
            }

            if (oldStatusId != newStatusId) {
                statusCountData[oldStatusId] = (statusCountData[oldStatusId]) ? statusCountData[oldStatusId] - 1 : -1;
                statusCountData[newStatusId] = (statusCountData[newStatusId]) ? statusCountData[newStatusId] + 1 : +1;

                // for map 1
                $scope.markerData1[nodeItem.id].setIcon({
                    labelOrigin: new google.maps.Point(15, -8),
                    url: nodeItem.icon,
                    scaledSize: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 0)
                });

                $scope.markerData1[nodeItem.id].statusId = newStatusId;

                // for map 2
                $scope.markerData2[nodeItem.id].setIcon({
                    labelOrigin: new google.maps.Point(15, -8),
                    url: nodeItem.icon,
                    scaledSize: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 0)
                });

                $scope.markerData2[nodeItem.id].statusId = newStatusId;

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
            $scope.mapSplitted = false;
            $scope.plotGraph(1, 'g002', true, true);
            $scope.plotGraph(1, 'g001', true, true);
        } else {
            $scope.routeData.r001 = [];
            $scope.routeData.r002 = [];
            $scope.graphData1.g001 = []
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
            //for map 1
            var marker1 = new google.maps.Marker({
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
                map: $scope.mapData1
            });

            google.maps.event.addListener(marker1, 'click', (function (marker1, scope) {
                return function () {
                    scope.$parent.safeApply(function () {
                        scope.sidebarActiveData.nodeId = marker1.id;
                        scope.openSidebar('sd006');
                    });
                };
            })(marker1, $scope));

            $scope.markerData1[nodeData[counter].id] = marker1;

            //for map 2
            var marker2 = new google.maps.Marker({
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
                map: $scope.mapData2
            });

            google.maps.event.addListener(marker2, 'click', (function (marker2, scope) {
                return function () {
                    scope.$parent.safeApply(function () {
                        scope.sidebarActiveData.nodeId = marker2.id;
                        scope.openSidebar('sd006');
                    });
                };
            })(marker2, $scope));

            $scope.markerData2[nodeData[counter].id] = marker2;

            if (nodeData[counter].boundary) {
                var polygon1,
                    polygon2,
                    i;

                for (i = 0; i < nodeData[counter].boundary.bounds.length; i++) {
                    var polygon1 = new google.maps.Polygon({
                        paths: nodeData[counter].boundary.bounds[i],
                        strokeColor: nodeData[counter].color,
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: nodeData[counter].boundary.color,
                        fillOpacity: 0.1
                    });

                    var polygon2 = new google.maps.Polygon({
                        paths: nodeData[counter].boundary.bounds[i],
                        strokeColor: nodeData[counter].color,
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: nodeData[counter].boundary.color,
                        fillOpacity: 0.1
                    });

                    polygon1.setMap($scope.mapData1);
                    polygon2.setMap($scope.mapData2);
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
                    $scope.mapSplitted = false;
                    $scope.plotGraph(1, 'g002', true, true);
                    $scope.plotGraph(1, 'g001', true, true);
                }

                if ('plot_code' in $location.search()) {
                    var plotCode = parseInt($location.search().plot_code, 10);

                    switch (plotCode) {
                        case PLOT_CODES.nodeItem:
                            var item = DataService.getNodeItem($location.search().node_id);

                            $scope.moveMapTo(1, item, true);
                            break;
                        case PLOT_CODES.route:
                            if (RouteService.getCustomRouteStep() == 3) {
                                $scope.plotGraph(1, 'g007', true, true);
                                RouteService.setCustomRouteStep(1);
                            }
                            break;
                    }
                }

                var markerCluster1 = new MarkerClusterer($scope.mapData1, $scope.markerData1, {
                    imagePath: '../assets/img/clusterer/'
                });

                var markerCluster2 = new MarkerClusterer($scope.mapData2, $scope.markerData2, {
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

    $scope.generateRouteRequests = function (mapNumber, routes) {
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

            if (routes[i].path[0].type.id == MAP_CENTRES.ct005.id) {
                //for map 1
                var marker1 = new google.maps.Marker({
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
                    map: $scope.mapData1
                });

                google.maps.event.addListener(marker1, 'click', (function (marker1, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.sidebarActiveData.nodeId = marker1.id;
                            scope.openSidebar('sd006');
                        });
                    };
                })(marker1, $scope));

                $scope.markerData1[routes[i].path[0].id] = marker1;

                //for map 2
                var marker2 = new google.maps.Marker({
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
                    map: $scope.mapData2
                });

                google.maps.event.addListener(marker2, 'click', (function (marker2, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.sidebarActiveData.nodeId = marker2.id;
                            scope.openSidebar('sd006');
                        });
                    };
                })(marker2, $scope));

                $scope.markerData2[routes[i].path[0].id] = marker2;
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
            $scope.processRouteRequests(mapNumber, requests, routes);
        }
    };

    $scope.processRouteRequests = function (mapNumber, requests, routes) {
        var directionsService = new google.maps.DirectionsService(),
            counter = 0,
            graphData,
            selectedGraphId,
            mapData;

        switch (mapNumber) {
            case 1:
                graphData = $scope.graphData1,
                    selectedGraphId = $scope.selectedGraph1.id,
                    mapData = $scope.mapData1;
                break;
            case 2:
                graphData = $scope.graphData2,
                    selectedGraphId = $scope.selectedGraph2.id,
                    mapData = $scope.mapData2;
                break;
        }

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
                if (routes[0].info.type.id == 'r001' || routes[0].info.type.id == 'r003') {
                    $scope.fitMapBoundsTo(mapNumber, routes[0]);
                }

                return;
            }

            submitRequest();
        }

        submitRequest();
    };

    $scope.fitMapBoundsTo = function (mapNumber, route) {
        var bounds = new google.maps.LatLngBounds(),
            mapData,
            markerData,
            i;

        switch (mapNumber) {
            case 1:
                mapData = $scope.mapData1;
                markerData = $scope.markerData1;
                break;
            case 2:
                mapData = $scope.mapData2;
                markerData = $scope.markerData2;
                break;
        }

        for (i = 0; i < route.path.length; i++) {
            bounds.extend(markerData[route.path[i].id].getPosition());
        }

        mapData.setCenter(bounds.getCenter());
        mapData.fitBounds(bounds);
    }

    $scope.moveMapTo = function (mapNumber, nodeItem, trigger) {
        var mapData,
            markerData;

        $scope.mapSplitted = false;

        switch (mapNumber) {
            case 1:
                mapData = $scope.mapData1;
                markerData = $scope.markerData1;
                break;
            case 2:
                mapData = $scope.mapData2;
                markerData = $scope.markerData2;
                break;
        }

        if (nodeItem) {
            mapData.setZoom(nodeItem.zoom);

            mapData.panTo({
                lat: nodeItem.coordinates.lat,
                lng: nodeItem.coordinates.lng
            });
        }

        if (trigger) {
            google.maps.event.trigger(markerData[nodeItem.id], 'click');
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
                $scope.mapSplitted = false;
                $scope.plotGraph(1, 'g001', false, true);
                break;
            case SIDEBAR_MODES.hospitalRouteList:
                $scope.mapSplitted = false;
                $scope.plotGraph(1, 'g003', false, true);
                break;
            case SIDEBAR_MODES.customRouteList:
                $scope.mapSplitted = false;
                $scope.plotGraph(1, 'g007', false, true);
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

        $scope.mapSplitted = false;

        $scope.moveMapTo(1, item, true);
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

    $scope.showDistanceMatrixDialog = function () {
        var distanceMatrixData = RouteService.getDistanceMatrixData();

        if (distanceMatrixData.info.nodeData.length > 0) {
            $scope.distanceMatrixData = distanceMatrixData;
            $scope.distanceMatrixDialogVisible = true;
        } else {
            $scope.$parent.showToast(["Distance matrix is not available as no abnormal sensor(s) detected."], 10000);
        }
    };

    $scope.hideDistanceMatrixDialog = function () {
        $scope.distanceMatrixDialogVisible = false;
    };

    $scope.toogleMapSplit = function () {
        $scope.mapSplitted = $scope.mapSplitted ? false : true;
    }

    $scope.plotGraph = function (mapNumber, newGraphId, forceUpdation, toastSuppression) {
        var coordinateData = [],
            graphData,
            mapData,
            oldGraphId,
            disasterReliefRouteData,
            medicalReliefRouteData,
            adjacencyMatrixData,
            customRouteData,
            i,
            j;

        switch (mapNumber) {
            case 1:
                graphData = $scope.graphData1
                mapData = $scope.mapData1;
                oldGraphId = $scope.selectedGraph1.id;
                $scope.selectedGraph1 = MAP_GRAPHS[newGraphId];
                break;
            case 2:
                graphData = $scope.graphData2
                mapData = $scope.mapData2;
                oldGraphId = $scope.selectedGraph2.id;
                $scope.selectedGraph2 = MAP_GRAPHS[newGraphId];
                break;
        }

        for (i = 0; i < graphData[oldGraphId].length; i++) {
            graphData[oldGraphId][i].setMap(null);
        }

        if (forceUpdation == true || graphData[newGraphId].length == 0) {
            switch (newGraphId) {
                case 'g001':
                    break;
                case 'g002':
                    disasterReliefRouteData = RouteService.getDisasterReliefRouteData();

                    if (disasterReliefRouteData.length > 0) {
                        $scope.generateRouteRequests(mapNumber, disasterReliefRouteData);
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no distater relief routes available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r001 = disasterReliefRouteData;
                    break;
                case 'g003':
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
                                strokeColor: MAP_GRAPHS.g002.color,
                                strokeWeight: 4,
                                strokeOpacity: 0.8
                            });

                            polyline.setMap(mapData);

                            graphData.g002.push(polyline);
                        }
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no distater relief routes available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r001 = disasterReliefRouteData;
                    break;

                case 'g004':
                    medicalReliefRouteData = RouteService.getMedicalReliefRouteData();

                    if (medicalReliefRouteData.length > 0) {
                        $scope.generateRouteRequests(mapNumber, medicalReliefRouteData);
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no medical relief routes available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r002 = medicalReliefRouteData;
                    break;
                case 'g005':
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
                                strokeOpacity: 0.8
                            });

                            polyline.setMap(mapData);

                            graphData.g002.push(polyline);
                        }

                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no medical relief routes available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r002 = medicalReliefRouteData;
                    break;
                case 'g006':
                    customRouteData = RouteService.getCustomRouteData();

                    if (customRouteData.length > 0) {
                        $scope.generateRouteRequests(mapNumber, customRouteData);
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no custom routes available."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r003 = customRouteData;
                    break;

                case 'g007':
                    customRouteData = RouteService.getCustomRouteData();

                    if (customRouteData.length > 0) {
                        for (i = 0; i < customRouteData.length; i++) {
                            coordinateData = [];

                            for (j = 0; j < customRouteData[i].path.length; j++) {
                                coordinateData.push({
                                    lat: customRouteData[i].path[j].coordinates.lat,
                                    lng: customRouteData[i].path[j].coordinates.lng
                                });
                            }

                            var polyline = new google.maps.Polyline({
                                path: coordinateData,
                                geodesic: true,
                                strokeColor: MAP_GRAPHS.g008.color,
                                strokeWeight: 4,
                                strokeOpacity: 0.8
                            });

                            polyline.setMap(mapData);

                            graphData.g008.push(polyline);
                        }

                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["There are no custom routes available."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }

                    $scope.routeData.r003 = customRouteData;
                    break;

                case 'g008':
                    adjacencyMatrixData = RouteService.getConnectivityGraphAdjacencyMatrixData();

                    if (adjacencyMatrixData.info.nodeData.length > 0) {
                        for (i = 0; i < adjacencyMatrixData.info.nodeData.length; i++) {
                            coordinateData = [];

                            for (j = 0; j < adjacencyMatrixData.info.nodeData.length; j++) {
                                if (adjacencyMatrixData.data[i][j]) {
                                    var polyline = new google.maps.Polyline({
                                        path: [{
                                                lat: adjacencyMatrixData.info.nodeData[i].coordinates.lat,
                                                lng: adjacencyMatrixData.info.nodeData[i].coordinates.lng
                                            },
                                            {
                                                lat: adjacencyMatrixData.info.nodeData[j].coordinates.lat,
                                                lng: adjacencyMatrixData.info.nodeData[j].coordinates.lng
                                            }
                                        ],
                                        geodesic: true,
                                        strokeColor: MAP_GRAPHS.g005,
                                        strokeWeight: 4,
                                        strokeOpacity: 0.8
                                    });

                                    polyline.setMap(mapData);

                                    graphData.g005.push(polyline);
                                }
                            }
                        }
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["Connectivity graph is not available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }
                    break;
                case 'g009':
                    adjacencyMatrixData = RouteService.getSpanningTreeAdjacencyMatrixData();

                    if (adjacencyMatrixData.info.nodeData.length > 0) {
                        for (i = 0; i < adjacencyMatrixData.info.nodeData.length; i++) {
                            coordinateData = [];

                            for (j = 0; j < adjacencyMatrixData.info.nodeData.length; j++) {
                                if (adjacencyMatrixData.data[i][j]) {
                                    var polyline = new google.maps.Polyline({
                                        path: [{
                                                lat: adjacencyMatrixData.info.nodeData[i].coordinates.lat,
                                                lng: adjacencyMatrixData.info.nodeData[i].coordinates.lng
                                            },
                                            {
                                                lat: adjacencyMatrixData.info.nodeData[j].coordinates.lat,
                                                lng: adjacencyMatrixData.info.nodeData[j].coordinates.lng
                                            }
                                        ],
                                        geodesic: true,
                                        strokeColor: MAP_GRAPHS.g006,
                                        strokeWeight: 4,
                                        strokeOpacity: 0.8
                                    });

                                    polyline.setMap(mapData);

                                    graphData.g005.push(polyline);
                                }
                            }
                        }
                    } else {
                        if (toastSuppression == false) {
                            $scope.$parent.showToast(["Spanning tree is not available as no abnormal sensor(s) detected."], 10000);
                        }

                        $scope.plotGraph(mapNumber, 'g001', false, false);
                    }
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
        $scope.mapData1 = new google.maps.Map(document.querySelector("#mapContainer1"), {
            center: {
                lat: 21.170240,
                lng: 72.831062
            },
            zoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        $scope.mapData2 = new google.maps.Map(document.querySelector("#mapContainer2"), {
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