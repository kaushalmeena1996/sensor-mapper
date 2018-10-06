var app = angular.module('sensorApp');

app.controller('RouteSensorCtrl', function ($scope, $location, $filter, SENSOR_TYPES, STATUS_TYPES, PagerService, RouteService) {
    $scope.sensorData = [];
    $scope.tableData = [];

    $scope.selectedSensors = [];

    $scope.sensorTypes = SENSOR_TYPES;
    $scope.statusTypes = STATUS_TYPES;

    $scope.visibleDivision = false;

    $scope.filter1 = '*';
    $scope.filter2 = '*';

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

    $scope.getSensors = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes/sensors');

        ref.on("value", function (snapshot) {
            var object = snapshot.val(),
                data = [];

            angular.forEach(object, function (item) {
                data.push(item);
            });

            $scope.$apply(function () {
                $scope.sensorData = data;
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

    $scope.setFilter1 = function (value) {
        $scope.filter1 = value;
        $scope.changePage(1);
    };

    $scope.setFilter2 = function (value) {
        $scope.filter2 = value;
        $scope.changePage(1);
    };

    $scope.toogleSensorDivision = function () {
        if ($scope.visibleDivision) {
            $('#sensorDivision').fadeOut();
            $scope.visibleDivision = false;
        } else {
            $('#sensorDivision').fadeIn();
            $scope.visibleDivision = true;
        }
    };

    $scope.selectSensor = function (item) {
        $scope.selectedSensors.push(item);
        $scope.changePage($scope.currentPage);
    };

    $scope.removeSensor = function (item) {
        $scope.selectedSensors.splice($scope.selectedSensors.indexOf(item), 1);
        $scope.changePage($scope.currentPage);
    };

    $scope.nextStep = function () {
        if ($scope.selectedSensors.length) {
            RouteService.setSensorData(angular.copy($scope.selectedSensors));
            RouteService.setRouteStep(3);

            $location.url('/route/result');
        } else {
            Metro.infobox.create('Atleast one sensor must be selected.', 'default');
        }
    };

    $scope.changePage = function (page) {
        var selectedIds = $scope.selectedSensors.map(
                function (e) {
                    return e.id;
                }
            ),
            sensorData = $scope.sensorData.filter(
                function (e) {
                    return selectedIds.indexOf(e.id) == -1;
                }
            );

        if ($scope.search) {
            sensorData = $filter('filter')(sensorData, {
                'name': $scope.search
            });
        }

        if ($scope.filter1 !== '*') {
            sensorData = $filter('filter')(sensorData, {
                'type': $scope.filter1
            }, true);
        }

        if ($scope.filter2 !== '*') {
            sensorData = $filter('filter')(sensorData, {
                'status': $scope.filter2
            }, true);
        }

        $scope.pager = PagerService.generatePager(sensorData.length, page);
        sensorData = sensorData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
        $scope.tableData = sensorData;
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getRouteStep()) {
            case 1:
                Metro.infobox.create('Please select a centre first.', 'warning');
                $location.url('/route/step-1');
                break;
            default:
                $scope.selectedSensors = RouteService.getSensorData();
                $scope.getSensors();
        }
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});