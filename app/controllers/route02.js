var app = angular.module('sensorApp');

app.controller('RouteSensorCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, SENSOR_TYPES, STATUS_TYPES, STATUS_CODES, SERVICE_EVENTS, PagerService, RouteService, DataService) {
    $scope.sensorData = [];
    $scope.tableData = [];

    $scope.selectedSensors = [];

    $scope.sensorTypes = SENSOR_TYPES;
    $scope.statusTypes = STATUS_TYPES;

    $scope.visibleDivision = false;

    $scope.search = '';

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

    $scope.getSensorDataAsArray = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.sensorData = DataService.getSensorDataAsArray();
                        $scope.changePage(1);
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.nodeItem.sensor == MAP_CATEGORIES.sensor) {
                        $scope.$parent.safeApply(function () {
                            $scope.sensorData = DataService.getSensorDataAsArray();
                            $scope.changePage(1);
                        });
                    }
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
            RouteService.setCustomSensorData(angular.copy($scope.selectedSensors));
            RouteService.setCustomRouteStep(3);

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
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                Metro.infobox.create('Please select a centre first.', 'warning');
                $location.url('/route/step-1');
                break;
            default:
                $scope.selectedSensors = RouteService.getCustomSensorData();
                $scope.getSensorDataAsArray();
        }
    });
});