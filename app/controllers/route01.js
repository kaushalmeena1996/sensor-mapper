var app = angular.module('sensorApp');
var map,
    ref;

app.controller('RouteCentreCtrl', function ($scope, $location, $filter, MAP_CENTRES, CENTRE_TYPES, PagerService, RouteService) {
    $scope.centreData = [];
    $scope.tableData = [];

    $scope.selectedCentres = [];

    $scope.centreTypes = CENTRE_TYPES;

    $scope.visibleDivision1 = false;
    $scope.visibleDivision2 = false;

    $scope.filter = '*';

    $scope.customCentre = {
        id: '',
        name: '',
        category: 'Centre',
        type: 'Custom Centre',
        status: 'Available',
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

    $scope.getCentres = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes/centres');

        ref.on("value", function (snapshot) {
            var object = snapshot.val(),
                data = [];

            angular.forEach(object, function (item) {
                data.push(item);
            });

            $scope.$apply(function () {
                $scope.centreData = data;
                $scope.changePage(1);
                $scope.$parent.hideLoadingOverlay();
            });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');

            $scope.$apply(function () {
                $scope.$parent.hideLoadingOverlay();
            });
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
        if ($scope.customCentre.latitude && $scope.customCentre.longitude) {
            $scope.customCentre.id = $scope.generateLocationId();
            $scope.selectedCentres.push($scope.customCentre);

            $scope.customCentre = {
                id: '',
                name: '',
                category: 'Centre',
                type: 'Custom Centre',
                status: 'Available',
                rating: 1.0,
                latitude: null,
                longitude: null
            };

            $scope.changePage($scope.currentPage);
        } else {
            Metro.infobox.create('Please select a location first.', 'default');
        }
    };

    $scope.removeCentre = function (item) {
        $scope.selectedCentres.splice($scope.selectedCentres.indexOf(item), 1);
        $scope.changePage($scope.currentPage);
    };

    $scope.nextStep = function () {
        if ($scope.selectedCentres.length) {
            RouteService.setCentreData(angular.copy($scope.selectedCentres));
            RouteService.setRouteStep(2);

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
        /*
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 21.1654031,
                lng: 72.7833882
            },
            zoom: 16
        });
        map.addListener('dblclick', function (event) {
            $scope.customCentre.latitude = event.latLng.lat();
            $scope.customCentre.longitude = event.latLng.lng();
            $("#lat").text(event.latLng.lat());
            $("#lng").text(event.latLng.lng());
        });
        */
        $scope.selectedCentres = RouteService.getCentreData();
        $scope.getCentres();
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});