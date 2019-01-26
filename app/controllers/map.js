var app = angular.module('sensorApp');
var map,
    markerData = {},
    routeData = {
        emergency: [],
        custom: []
    },
    chart = null;

app.controller('MapCtrl', function ($scope, $compile, $location, $filter, MAP_CATEGORIES, MAP_CENTRES, SENSOR_STATUSES, MAP_ROUTES, STATUS_CODES, CHARMS_BAR_DATA, CHARMS_BAR_MODES, PLOT_CODES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.nodeData = [];
    $scope.tableData = [];

    $scope.emergencyRouteData = [];
    $scope.customRouteData = [];

    $scope.modes = CHARMS_BAR_MODES;

    $scope.charmBarTitle = '';

    $scope.charmBarMode = 0;

    $scope.charmBarNodeItem = {};

    $scope.search = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.failedSensorCount = 0;
    $scope.abnormalSensorCount = 0;

    $scope.mapLoaded = false;

    $scope.getNodeDataAsArray = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccess:
                    $scope.$parent.safeApply(function () {
                        $scope.nodeData = DataService.getNodeDataAsArray();
                        $scope.createMap();
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccess:
                    if ($scope.mapLoaded) {
                        $scope.nodeData = DataService.getNodeDataAsArray();
                        $scope.updateMap(data.nodeItem);
                    }
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
                case STATUS_CODES.dataUpdateFailed:
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
            }
        });
    };

    $scope.updateMap = function (nodeItem) {
        if (nodeItem.category == MAP_CATEGORIES.sensor) {

            $("#info-window-" + nodeItem.id)
                .find(".content")
                .eq(0)
                .html(nodeItem.value + ' ' + nodeItem.unit)

            if ($('#chartBox').data('infobox').isOpen() && chart) {
                chart.data.datasets[0].data.push({
                    x: new Date(),
                    y: nodeItem.value
                });
                chart.update();
            }

            if (nodeItem.dynamicCoordinates) {
                markerData[nodeItem.id].setPosition({
                    lat: nodeItem.latitude,
                    lng: nodeItem.longitude
                });

                $("#info-window-" + nodeItem.id)
                    .find(".address")
                    .eq(0)
                    .html(nodeItem.address)
            }

            if (nodeItem.status != markerData[nodeItem.id].status) {
                var emergencyRouteData = RouteService.getEmergencyRouteData(),
                    failedCount = DataService.getFailedSensorCount(),
                    abnormalCount = DataService.getAbnormalSensorCount(),
                    i;

                markerData[nodeItem.id].setIcon({
                    labelOrigin: new google.maps.Point(15, -8),
                    url: nodeItem.icon
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
                    $scope.failedSensorCount = failedCount;
                    $scope.abnormalSensorCount = abnormalCount;
                });

                switch (nodeItem.status) {
                    case SENSOR_STATUSES.failure:
                        Metro.notify.create("Sensor " + nodeItem.name + " failed.", "Alert", {
                            cls: "warning"
                        });
                        break;
                    case SENSOR_STATUSES.abnormal:
                        Metro.notify.create("Sensor " + nodeItem.name + " is behaving abnormally.", "Alert", {
                            cls: "alert"
                        });
                        break;
                }

                markerData[nodeItem.id].status = nodeItem.status;
            }
        }
    };

    $scope.createMap = function () {
        var nodeData = $scope.nodeData,
            counter = 0;

        function plotMarkers() {
            if (nodeData[counter].display) {
                var marker = new google.maps.Marker({
                    id: nodeData[counter].id,
                    label: nodeData[counter].name,
                    position: {
                        lat: nodeData[counter].latitude,
                        lng: nodeData[counter].longitude
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -8),
                        url: nodeData[counter].icon,
                        scaledSize: new google.maps.Size(32, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    status: nodeData[counter].status,
                    map: map
                });

                google.maps.event.addListener(marker, 'click', (function (marker, scope) {
                    return function () {
                        scope.$parent.safeApply(function () {
                            scope.openCharmsBar('sd007', marker.id);
                        });
                    };
                })(marker, $scope));

                markerData[nodeData[counter].id] = marker;

                if (nodeData[counter].bounds) {
                    angular.forEach(nodeData[counter].bounds, function (item) {
                        polygon = new google.maps.Polygon({
                            paths: item,
                            strokeColor: nodeData[counter].color,
                            strokeOpacity: 0.3,
                            strokeWeight: 2,
                            fillColor: nodeData[counter].color,
                            fillOpacity: 0.1,
                        });

                        polygon.setMap(map);
                    });
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
                    var action_code = parseInt($location.search().action_code, 10);

                    switch (action_code) {
                        case PLOT_CODES.nodeItem:
                            var nodeItem = DataService.getNodeItem($location.search().node_id);

                            if (nodeItem) {
                                $scope.moveMapTo(nodeItem, true);
                            }

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
        var content = '';

        content += '<div class="map-info-window" id="info-window-' + nodeItem.id + '">';
        content += '<div class="name">' + nodeItem.name + '</h5>';
        content += '<div class="type">' + nodeItem.typeName + '</div>';

        if (nodeItem.category == MAP_CATEGORIES.sensor) {
            content += '<div class="content">' + nodeItem.value + ' ' + nodeItem.unit + '</div>';
        }

        content += '<div class="address">' + nodeItem.address + '</div>';

        content += '<div class="action">';
        content += '<button type="button" class="button square secondary outline small" ng-click="showNodeItem(\'' + nodeItem.id + '\',\'' + nodeItem.category + '\')">';
        content += '<span class="mif-folder-open mif-2x"></span>';
        content += '</button>';

        if (nodeItem.category == MAP_CATEGORIES.sensor) {
            content += '<button type="button" class="button square secondary outline small" ng-click="openSensorChart(\'' + nodeItem.id + '\',\'' + nodeItem.unit + '\')">';
            content += '<span class="mif-chart-dots mif-2x"></span>';
            content += '</button>';
        }

        content += '</div>';
        content += '</div>';

        content = $compile(content)($scope);

        return content[0];
    };

    $scope.generateRouteRequests = function (routes) {
        var requests = [],
            requestObject,
            i,
            j;

        for (i = 0; i < routes.length; i++) {
            requestObject = {
                origin: {
                    lat: routes[i].routeArray[0].latitude,
                    lng: routes[i].routeArray[0].longitude
                },
                destination: {
                    lat: routes[i].routeArray[routes[i].routeArray.length - 1].latitude,
                    lng: routes[i].routeArray[routes[i].routeArray.length - 1].longitude
                },
                travelMode: 'DRIVING'
            };

            if (routes[i].routeArray[0].typeName == MAP_CENTRES.ct00x.name) {
                var marker = new google.maps.Marker({
                    label: routes[i].routeArray[0].name,
                    position: {
                        lat: routes[i].routeArray[0].latitude,
                        lng: routes[i].routeArray[0].longitude
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -5),
                        url: routes[i].routeArray[0].icon
                    },
                    status: routes[i].routeArray[0].status,
                    map: map
                });

                var content = $scope.generateContent(routes[i].routeArray[0]);

                marker.infoWindow = new google.maps.InfoWindow({
                    maxWidth: 200,
                    content: content
                });

                marker.addListener('click', function () {
                    marker.infoWindow.open(map, this);
                });

                markerData[routes[i].routeArray[0].id] = marker;
            }

            if (routes[i].routeArray.length > 2) {
                requestObject.waypoints = [];

                for (j = 1; j < routes[i].routeArray.length - 1; j++) {
                    requestObject.waypoints.push({
                        location: {
                            lat: routes[i].routeArray[j].latitude,
                            lng: routes[i].routeArray[j].longitude
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
        map.setZoom(nodeItem.zoom);

        map.panTo({
            lat: nodeItem.latitude,
            lng: nodeItem.longitude
        });

        if (trigger) {
            google.maps.event.trigger(markerData[nodeItem.id], 'click');
        }
    };

    $scope.openCharmsBar = function (charmBarId, nodeId) {
        $scope.charmBarMode = CHARMS_BAR_DATA[charmBarId].mode;

        switch ($scope.charmBarMode) {
            case CHARMS_BAR_MODES.markerList:
                if (CHARMS_BAR_DATA[charmBarId].filter1) {
                    $scope.filter1 = CHARMS_BAR_DATA[charmBarId].filter1;
                }
                if (CHARMS_BAR_DATA[charmBarId].filter2) {
                    $scope.filter2 = CHARMS_BAR_DATA[charmBarId].filter2;
                }
                $scope.applyFilter();
                break;
            case CHARMS_BAR_MODES.markerInformation:
                $scope.setCharmBarNodeInfo(nodeId);
                break;
        }

        $scope.charmBarTitle = CHARMS_BAR_DATA[charmBarId].title;

        $('#charmsBar').data('charms').open();
    };

    $scope.closeCharmsBar = function () {
        $('#charmsBar').data('charms').close();
    };

    $scope.setCharmBarNodeInfo = function (id) {
        var nodeData = $scope.nodeData;

        $scope.charmBarNodeItem = $filter('filter')(nodeData, {
            'id': id
        }, true)[0];

        $scope.tableData = $filter('filter')(nodeData, {
            'parentId': id
        }, true);
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

    $scope.openSensorChart = function (sensorId, sensorUnit) {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeChartData(sensorId, $scope, SERVICE_EVENTS.chartData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccess:
                    if (chart) {
                        chart.data.datasets[0].data = data.chartData
                        chart.update();
                    } else {
                        chart = new Chart($("#chartCanvas"), {
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
                                            return tooltipItems.yLabel + sensorUnit;
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
                                            labelString: sensorUnit
                                        }
                                    }]
                                }
                            }
                        });
                    }

                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });

                    $('#chartBox').data('infobox').open();
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
            }
        });
    }

    $scope.showNodeItem = function (id, category) {
        var link = '/view',
            category = category.toLowerCase();

        link += '/' + category;
        link += '?' + category + '_id=' + id;

        $location.url(link);
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