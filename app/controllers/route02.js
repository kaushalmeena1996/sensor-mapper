var app = angular.module('sensorApp');

app.controller('RouteSensorController', function ($scope, $location, $filter, MAP_CATEGORIES, SENSOR_TYPES, SENSOR_STATUS_TYPES, STATUS_CODES, SERVICE_EVENTS, PagerService, RouteService, DataService) {
    $scope.tableData = [];

    $scope.selectedSensors = [];

    $scope.sensorTypes = SENSOR_TYPES;
    $scope.sensorStatusTypes = SENSOR_STATUS_TYPES;

    $scope.visibleDivision = false;

    $scope.query = '';

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

    $scope.getSensorData = function () {
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
                    if (data.nodeItem.category == MAP_CATEGORIES.sensor) {
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
            Metro.infobox.create('<h5>Info</h5><span>Atleast one sensor must be selected.</span>', 'default');
        }
    };

    $scope.changePage = function (page) {
        var sensorData = DataService.getSensorData(),
            selectedIds = $scope.selectedSensors.map(
                function (sensorItem) {
                    return sensorItem.id;
                }
            );

        sensorData = sensorData.filter(
            function (sensorItem) {
                return selectedIds.indexOf(sensorItem.id) == -1;
            }
        );

        if ($scope.query) {
            sensorData = $filter('filter')(sensorData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            sensorData = $filter('filter')(sensorData, {
                type: { name: $scope.filter1 }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            sensorData = $filter('filter')(sensorData, {
                status: { name: $scope.filter2 }
            }, true);
        }

        $scope.pager = PagerService.generatePager(sensorData.length, page);
        sensorData = sensorData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
        $scope.tableData = sensorData;
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                Metro.infobox.create('<h5>Error</h5><span>Please select a centre first.</span>', 'warning');
                $location.url('/route/step-1');
                break;
            default:
                $scope.selectedSensors = RouteService.getCustomSensorData();
                $scope.getSensorData();
        }
    });
});