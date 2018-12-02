var app = angular.module('sensorApp');

app.controller('ViewSensorCtrl', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.sensorItem = {};
    $scope.sensorItemLoaded = false;

    $scope.sensorId = '';

    $scope.valueItem = {};
    $scope.valueItemLoaded = false;

    $scope.getSensorItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.sensorItem = DataService.getNodeItem($scope.sensorId);
                        $scope.sensorItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.nodeItem.id == $scope.sensorId) {
                        $scope.$parent.safeApply(function () {
                            $scope.sensorItem = data.nodeItem;
                        });
                    }
                    break;
            }
        });

        DataService.subscribeValueData($scope, SERVICE_EVENTS.valueDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.valueItem = DataService.getValueItem($scope.sensorId);
                        $scope.valueItemLoaded = true;
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.valueItem.id == $scope.sensorId) {
                        $scope.$parent.safeApply(function () {
                            $scope.valueItem = data.valueItem;
                        });
                    }
                    break;
            }
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('sensor_id' in $location.search()) {
            $scope.sensorId = $location.search().sensor_id;
            $scope.getSensorItem();
        } else {
            Metro.infobox.create('sensor_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});