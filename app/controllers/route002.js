var app = angular.module('sensorApp');

app.controller('RouteSensorController', function ($scope, $location, $filter, MAP_CATEGORIES, SENSOR_TYPES, SENSOR_STATUS_TYPES, STATUS_CODES, SERVICE_EVENTS, RouteService, DataService) {
    $scope.tableData = [];

    $scope.selectedSensors = [];

    $scope.sensorTypes = SENSOR_TYPES;
    $scope.sensorStatusTypes = SENSOR_STATUS_TYPES;

    $scope.sensorSelectorVisible = false;

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';

    $scope.getSensorData = function () {
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

    $scope.appendSensor = function (item) {
        $scope.selectedSensors.push(item);
        $scope.applyFilter();
    };

    $scope.removeSensor = function (item) {
        $scope.selectedSensors.splice($scope.selectedSensors.indexOf(item), 1);
        $scope.applyFilter();
    };

    $scope.nextStep = function () {
        if ($scope.selectedSensors.length) {
            RouteService.setCustomSensorData(angular.copy($scope.selectedSensors));
            RouteService.setCustomRouteStep(3);

            $location.url($scope.$parent.pageData.pd006.route);
        } else {
            $scope.$parent.showDialog('Information', 'Atleast one sensor must be selected.')
        }
    };

    $scope.applyFilter = function () {
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

        $scope.tableData = sensorData;
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                $scope.$parent.showDialog('Error', 'Please complete step-1 first.')

                $location.url($scope.$parent.pageData.pd004.route);
                break;
            default:
                $scope.selectedSensors = RouteService.getCustomSensorData();
                $scope.getSensorData();
        }
    });
});