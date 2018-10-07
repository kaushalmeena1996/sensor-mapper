var app = angular.module('sensorApp');

app.controller('ViewSensorCtrl', function ($scope, $location, SERVICE_EVENTS, DataService) {
    $scope.sensorDetail = {};
    $scope.sensorId = '';

    $scope.divisionVisible = false;

    $scope.getSensorDetail = function () {
        $scope.$parent.showLoadingOverlay();

        if (DataService.isNodeDataLoaded()) {
            $scope.sensorDetail = DataService.getSensorDetail($scope.sensorId);
            $scope.divisionVisible = true;
            $scope.$parent.hideLoadingOverlay();
        } else {
            DataService.fetchNodeData();

            DataService.subscribe($scope, SERVICE_EVENTS.nodeDataChanged, function () {
                $scope.$apply(function () {
                    $scope.sensorDetail = DataService.getSensorDetail($scope.sensorId);
                    $scope.divisionVisible = true;
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        }
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('sensor_id' in $location.search()) {
            $scope.sensorId = $location.search().sensor_id;
            $scope.getSensorDetail();
        } else {
            Metro.infobox.create('sensor_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});