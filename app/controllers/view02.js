var app = angular.module('sensorApp');

app.controller('ViewLocationCtrl', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.locationItem = {};
    $scope.locationItemLoaded = false;

    $scope.locationId = '';

    $scope.getLocationItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.locationItem = DataService.getNodeItem($scope.locationId);
                        $scope.locationItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.nodeItem.id == $scope.locationId) {
                        $scope.$parent.safeApply(function () {
                            $scope.locationItem = data.nodeItem;
                        });
                    }
                    break;
            }
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('location_id' in $location.search()) {
            $scope.locationId = $location.search().location_id;
            $scope.getLocationItem();
        } else {
            Metro.infobox.create('location_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});