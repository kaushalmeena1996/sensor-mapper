var app = angular.module('sensorApp');
var map,
    markerObject = null;

app.controller('RouteCentreCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, CENTRE_TYPES, STATUS_CODES, SERVICE_EVENTS, PagerService, RouteService, DataService) {
    $scope.centreData = [];
    $scope.tableData = [];

    $scope.selectedCentres = [];

    $scope.centreTypes = CENTRE_TYPES;

    $scope.visibleDivision1 = false;
    $scope.visibleDivision2 = false;

    $scope.search = '';

    $scope.filter = '*';

    $scope.customCentre = {
        id: '',
        category: 'Centre',
        name: '',
        type: 'Custom Centre',
        status: 'Available',
        icon: 'assets/img/map/centres/custom-centre.png',
        rating: 1.0,
        latitude: null,
        longitude: null
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

    $scope.getCentreDataAsArray = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.centreData = DataService.getCentreDataAsArray();
                        $scope.changePage(1);
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.nodeItem.category == MAP_CATEGORIES.centre) {
                        $scope.$parent.safeApply(function () {
                            $scope.centreData = DataService.getCentreDataAsArray();
                            $scope.changePage(1);
                        });
                    }
                    break;
            }
        });
    };

    $scope.setFilter = function (value) {
        $scope.filter = value;
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
        if ($scope.customCentre.name && $scope.customCentre.latitude && $scope.customCentre.longitude) {
            $scope.$parent.showLoadingOverlay();

            $scope.customCentre.id = $scope.generateLocationId();

            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ "location": { lat: $scope.customCentre.latitude, lng: $scope.customCentre.longitude } }, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        $scope.$parent.safeApply(function () {
                            $scope.customCentre.address = results[0].formatted_address;

                            $scope.selectedCentres.push($scope.customCentre);

                            $scope.customCentre = {
                                id: '',
                                category: 'Centre',
                                name: '',
                                type: 'Custom Centre',
                                status: 'Available',
                                icon: 'assets/img/map/centres/custom-centre.png',
                                address: '',
                                rating: 1.0,
                                latitude: null,
                                longitude: null
                            };

                            $scope.changePage($scope.currentPage);
                        });
                    } else {
                        Metro.infobox.create('Geocoder ended with no results.', 'default');
                    }
                } else {
                    Metro.infobox.create('Geocoder failed due to: ' + status, 'default');
                }

                $scope.$parent.safeApply(function () {
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        } else {
            Metro.infobox.create('Please enter the name of centre and then select a location by right clicking on map.', 'default');
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
            Metro.infobox.create('Atleast one centre must be selected.', 'default');
        }
    };

    $scope.changePage = function (page) {
        var selectedIds = $scope.selectedCentres.map(
            function (e) {
                return e.id;
            }
        ),
            centreData = $scope.centreData.filter(
                function (e) {
                    return selectedIds.indexOf(e.id) == -1;
                }
            );

        if ($scope.search) {
            centreData = $filter('filter')(centreData, {
                'name': $scope.search
            });
        }

        if ($scope.filter !== '*') {
            centreData = $filter('filter')(centreData, {
                'type': $scope.filter
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
            $scope.customCentre.latitude = event.latLng.lat();
            $scope.customCentre.longitude = event.latLng.lng();

            if (markerObject) {
                markerObject.setPosition({
                    lat: $scope.customCentre.latitude,
                    lng: $scope.customCentre.longitude
                });
            } else {
                markerObject = new google.maps.Marker({
                    label: $scope.customCentre.name,
                    position: {
                        lat: $scope.customCentre.latitude,
                        lng: $scope.customCentre.longitude
                    },
                    icon: {
                        labelOrigin: new google.maps.Point(15, -5),
                        url: $scope.customCentre.icon
                    },
                    map: map
                });
            }

            $("#lat").text($scope.customCentre.latitude);
            $("#lng").text($scope.customCentre.latitude);
        });

        $scope.selectedCentres = RouteService.getCustomCentreData();
        $scope.getCentreDataAsArray();
    });
});