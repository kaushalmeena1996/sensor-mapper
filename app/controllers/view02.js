var app = angular.module('sensorApp');

app.controller('ViewLocationCtrl', function ($scope, $location, SERVICE_EVENTS, DataService) {
    $scope.locationDetail = {};
    $scope.locationId = '';

    $scope.divisionVisible = false;

    $scope.getLocationDetail = function () {
        $scope.$parent.showLoadingOverlay();

        if (DataService.isNodeDataLoaded()) {
            $scope.locationDetail = DataService.getLocationDetail($scope.locationId);
            $scope.divisionVisible = true;
            $scope.$parent.hideLoadingOverlay();
        } else {
            DataService.fetchNodeData();

            DataService.subscribe($scope, SERVICE_EVENTS.nodeDataChanged, function () {
                $scope.$apply(function () {
                    $scope.locationDetail = DataService.getLocationDetail($scope.locationId);
                    $scope.divisionVisible = true;
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        }
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('location_id' in $location.search()) {
            $scope.locationId = $location.search().location_id;
            $scope.getLocationDetail();
        } else {
            Metro.infobox.create('location_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});