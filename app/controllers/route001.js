var app = angular.module('app');
var map,
    markerObject = null;

app.controller('RouteCentreController', function ($scope, $location, $filter, MAP_CATEGORIES, MAP_CENTRES, CENTRE_TYPES, CENTRE_STATUSES, CENTRE_STATUS_TYPES, STATUS_CODES, SERVICE_EVENTS, IMAGE_DATA, RouteService, DataService) {
    $scope.tableData = [];

    $scope.selectedCentres = [];

    $scope.centreTypes = CENTRE_TYPES;
    $scope.centreStatusTypes = CENTRE_STATUS_TYPES;

    $scope.centreSelectorVisible = false;
    $scope.customCentreSelectorVisible = false;

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.customCentre = {
        id: '',
        parentId: 'l001',
        category: MAP_CATEGORIES.c001,
        name: '',
        address: '',
        icon: MAP_CENTRES.ctxxx.icons.cst001,
        type: {
            id: MAP_CENTRES.ctxxx.id,
            name: MAP_CENTRES.ctxxx.name
        },
        status: CENTRE_STATUSES.cst001,
        photo: IMAGE_DATA.id009.path,
        description: '',
        rating: 1.0,
        leafNode: true,
        display: true,
        zoom: 20,
        coordinates: {
            lat: null,
            lng: null,
            dynamic: false
        }
    };

    $scope.getCentreData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.applyFilter();
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    var tableData = $scope.tableData,
                        tableDataUpdated = false,
                        nodeIndex,
                        nodeItem,
                        i;

                    for (i = 0; i < data.updatedNodeIds.length; i++) {
                        nodeIndex = tableData.findIndex(
                            function (tableItem) {
                                return tableItem.id == data.updatedNodeIds[i];
                            }
                        );

                        if (nodeIndex > -1) {
                            nodeItem = DataService.getNodeItem(data.updatedNodeIds[i]);

                            if (tableData[nodeIndex].status.id != nodeItem.status.id) {
                                tableData[nodeIndex] = nodeItem;
                                tableDataUpdated = true;
                            }
                        }
                    }

                    if (tableDataUpdated) {
                        $scope.$parent.safeApply(function () {
                            $scope.tableData = tableData;
                        });
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

    $scope.appendCentre = function (item) {
        $scope.selectedCentres.push(item);
        $scope.applyFilter();
    };

    $scope.appendCustomCentre = function () {
        if ($scope.customCentre.coordinates.lat && $scope.customCentre.coordinates.lng) {
            $scope.$parent.showLoadingOverlay();

            $scope.customCentre.id = $scope.generateLocationId();

            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ "location": { lat: $scope.customCentre.coordinates.lat, lng: $scope.customCentre.coordinates.lng } }, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        $scope.$parent.safeApply(function () {
                            $scope.customCentre.address = results[0].formatted_address;

                            $scope.selectedCentres.push($scope.customCentre);

                            $scope.customCentre = {
                                id: '',
                                parentId: 'l001',
                                category: 'c001',
                                name: '',
                                address: '',
                                icon: MAP_CENTRES.ctxxx.icons.cst001,
                                type: {
                                    id: MAP_CENTRES.ctxxx.id,
                                    name: MAP_CENTRES.ctxxx.name
                                },
                                status: CENTRE_STATUSES.cst001,
                                photo: IMAGE_DATA.id009.path,
                                description: '',
                                rating: 1.0,
                                leafNode: true,
                                display: true,
                                zoom: 20,
                                coordinates: {
                                    lat: null,
                                    lng: null,
                                    dynamic: false
                                }
                            };

                            $scope.applyFilter();
                        });
                    } else {
                        $scope.$parent.showDialog('Error', 'Geocoder ended with no results.');
                    }
                } else {
                    $scope.$parent.showDialog('Error', 'Geocoder failed due to: ' + status + '.');
                }

                $scope.$parent.safeApply(function () {
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        } else {
            $scope.$parent.showDialog('Error', 'Please select a location by right clicking on map.');
        }
    };

    $scope.removeCentre = function (item) {
        $scope.selectedCentres.splice($scope.selectedCentres.indexOf(item), 1);
        $scope.applyFilter();
    };

    $scope.nextStep = function () {
        if ($scope.selectedCentres.length) {
            RouteService.setCustomCentreData(angular.copy($scope.selectedCentres));
            RouteService.setCustomRouteStep(2);

            $location.url($scope.$parent.pageData.pd005.route);
        } else {
            $scope.$parent.showDialog('Infomation', 'Atleast one centre must be selected.')
        }
    };

    $scope.applyFilter = function () {
        var nodeData = DataService.getCentreData(),
            selectedIds = $scope.selectedCentres.map(
                function (centreItem) {
                    return centreItem.id;
                }
            );

        nodeData = nodeData.filter(
            function (centreItem) {
                return selectedIds.indexOf(centreItem.id) == -1;
            }
        );

        if ($scope.query) {
            nodeData = $filter('filter')(nodeData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                type: { id: $scope.filter1 }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                status: { id: $scope.filter2 }
            }, true);
        }

        $scope.tableData = nodeData;
    };

    $scope.generateLocationId = function () {
        var text = 'cc',
            possible_string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            i;

        for (i = 0; i < 10; i++) {
            text += possible_string.charAt(Math.floor(Math.random() * possible_string.length));
        }

        return text;
    };

    $scope.$on('$viewContentLoaded', function () {
        map = new google.maps.Map(document.querySelector(".map-container-2"), {
            center: {
                lat: 21.1654031,
                lng: 72.7833882
            },
            zoom: 16
        });

        map.addListener('rightclick', function (event) {
            var lat = event.latLng.lat(),
                lng = event.latLng.lng();

            if (markerObject) {
                markerObject.setPosition({
                    lat: lat,
                    lng: lng
                });

                DataService.updateNodeItem($scope.customCentre);
            } else {
                markerObject = new google.maps.Marker({
                    id: $scope.customCentre.id,
                    label: $scope.customCentre.name,
                    position: {
                        lat: lat,
                        lng: lng
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -8),
                        url: $scope.customCentre.icon,
                        scaledSize: new google.maps.Size(32, 32),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    map: map
                });

                DataService.appendNodeItem($scope.customCentre);
            }

            $scope.$parent.safeApply(function () {
                $scope.customCentre.coordinates.lat = lat;
                $scope.customCentre.coordinates.lng = lng;
            });
        });

        $scope.selectedCentres = RouteService.getCustomCentreData();
        $scope.getCentreData();
    });
});