var app = angular.module('sensorApp');
var map,
    markerObject = null;

app.controller('RouteCentreController', function ($scope, $location, $filter, MAP_CATEGORIES, CUSTOM_CENTRE, CENTRE_TYPES, CENTRE_STATUSES, CENTRE_STATUS_TYPES, STATUS_CODES, SERVICE_EVENTS, DEFAULT_PHOTO_PATH, PagerService, RouteService, DataService) {
    $scope.tableData = [];

    $scope.selectedCentres = [];

    $scope.centreTypes = CENTRE_TYPES;
    $scope.centreStatusTypes = CENTRE_STATUS_TYPES;

    $scope.visibleDivision1 = false;
    $scope.visibleDivision2 = false;

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.customCentre = {
        id: '',
        parentId: 'l001',
        category: MAP_CATEGORIES.centre,
        name: '',
        address: '',
        icon: CUSTOM_CENTRE.icon.cst001,
        type: {
            id: 'ctxxx',
            name: CUSTOM_CENTRE.name
        },
        status: CENTRE_STATUSES.cst001,
        photo: DEFAULT_PHOTO_PATH,
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

    $scope.pager = {
        totalItems: 1,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        startPage: 1,
        endPage: 1,
        startIndex: 0,
        endIndex: 0,
        pages: []
    };

    $scope.getCentreData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.changePage(1);
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    if (data.nodeItem.category == MAP_CATEGORIES.centre) {
                        var index = $scope.tableData.findIndex(
                            function (tableItem) {
                                return tableItem.id == data.nodeItem.id;
                            }
                        );

                        if (index > -1) {
                            $scope.$parent.safeApply(function () {
                                $scope.tableData[index] = data.nodeItem;
                            });
                        }
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

    $scope.setFilter1 = function (value) {
        $scope.filter1 = value;
        $scope.changePage(1);
    };
    $scope.setFilter2 = function (value) {
        $scope.filter2 = value;
        $scope.changePage(1);
    };

    $scope.toogleCentreDivision = function () {
        if ($scope.visibleDivision1) {
            $('#centreDivision').fadeOut();
            $scope.visibleDivision1 = false;
        } else {
            $('#centreDivision').fadeIn();
            $scope.visibleDivision1 = true;
        }
    };

    $scope.toogleLocationDivision = function () {
        if ($scope.visibleDivision2) {
            $('#locationDivision').fadeOut();
            $scope.visibleDivision2 = false;
        } else {
            $('#locationDivision').fadeIn();
            $scope.visibleDivision2 = true;
        }
    };

    $scope.selectCentre = function (item) {
        $scope.selectedCentres.push(item);
        $scope.changePage($scope.currentPage);
    };

    $scope.selectLocation = function () {
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
                                category: MAP_CATEGORIES.centre,
                                name: '',
                                address: '',
                                icon: CUSTOM_CENTRE.icon.cst001,
                                type: {
                                    id: 'ctxxx',
                                    name: CUSTOM_CENTRE.name
                                },
                                status: CENTRE_STATUSES.cst001,
                                photo: DEFAULT_PHOTO_PATH,
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

                            $scope.changePage($scope.currentPage);
                        });
                    } else {
                        Metro.infobox.create('<h5>Error</h5><span>Geocoder ended with no results.</span>', 'warning');
                    }
                } else {
                    Metro.infobox.create('<h5>Error</h5><span>Geocoder failed due to: ' + status + '.</span>', 'warning');
                }

                $scope.$parent.safeApply(function () {
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        } else {
            Metro.infobox.create('<h5>Info</h5><span>Please select a location by right clicking on map.</span>', 'default');
        }
    };

    $scope.removeCentre = function (item) {
        $scope.selectedCentres.splice($scope.selectedCentres.indexOf(item), 1);
        $scope.changePage($scope.currentPage);
    };

    $scope.nextStep = function () {
        if ($scope.selectedCentres.length) {
            RouteService.setCustomCentreData(angular.copy($scope.selectedCentres));
            RouteService.setCustomRouteStep(2);

            $location.url('/route/step-2');
        } else {
            Metro.infobox.create('<h5>Info</h5><span>Atleast one centre must be selected.</span>', 'default');
        }
    };

    $scope.changePage = function (page) {
        var centreData = DataService.getCentreData(),
            selectedIds = $scope.selectedCentres.map(
                function (centreItem) {
                    return centreItem.id;
                }
            );

        centreData = centreData.filter(
            function (centreItem) {
                return selectedIds.indexOf(centreItem.id) == -1;
            }
        );

        if ($scope.query) {
            centreData = $filter('filter')(centreData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            centreData = $filter('filter')(centreData, {
                type: { name: $scope.filter1 }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            centreData = $filter('filter')(centreData, {
                status: { name: $scope.filter2 }
            }, true);
        }

        $scope.pager = PagerService.generatePager(centreData.length, page);
        centreData = centreData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
        $scope.tableData = centreData;
    };

    $scope.generateLocationId = function () {
        var text = 'cc_',
            possible_string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            i;

        for (i = 0; i < 10; i++) {
            text += possible_string.charAt(Math.floor(Math.random() * possible_string.length));
        }

        return text;
    };

    $scope.$on('$viewContentLoaded', function () {
        map = new google.maps.Map(document.getElementById('map2'), {
            center: {
                lat: 21.1654031,
                lng: 72.7833882
            },
            zoom: 16
        });

        map.addListener('rightclick', function (event) {
            $scope.customCentre.coordinates.lat = event.latLng.lat();
            $scope.customCentre.coordinates.lng = event.latLng.lng();

            if (markerObject) {
                markerObject.setPosition({
                    lat: $scope.customCentre.coordinates.lat,
                    lng: $scope.customCentre.coordinates.lng
                });

                DataService.updateNodeItem($scope.customCentre);
            } else {
                markerObject = new google.maps.Marker({
                    id: $scope.customCentre.id,
                    label: $scope.customCentre.name,
                    position: {
                        lat: $scope.customCentre.coordinates.lat,
                        lng: $scope.customCentre.coordinates.lng
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

            $("#lat").text($scope.customCentre.coordinates.lat);
            $("#lng").text($scope.customCentre.coordinates.lat);
        });

        $scope.selectedCentres = RouteService.getCustomCentreData();
        $scope.getCentreData();
    });
});