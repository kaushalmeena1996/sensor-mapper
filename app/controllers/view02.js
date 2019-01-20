var app = angular.module('sensorApp');

app.controller('ViewLocationCtrl', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.locationItem = {};
    $scope.locationItemLoaded = false;

    $scope.locationId = '';

    $scope.getLocationItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccess:
                    $scope.$parent.safeApply(function () {
                        $scope.locationItem = DataService.getNodeItem($scope.locationId);
                        $scope.locationItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccess:
                    if (data.nodeItem.id == $scope.locationId) {
                        $scope.$parent.safeApply(function () {
                            $scope.locationItem = data.nodeItem;
                        });
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

    $scope.$on('$viewContentLoaded', function () {
        if ('location_id' in $location.search()) {
            $scope.locationId = $location.search().location_id;
            $scope.getLocationItem();
        } else {
            Metro.infobox.create('<h5>Error</h5><span>location_id was not found in the query parameters.<span>', 'warning');
            $location.url('/home');
        }
    });
});