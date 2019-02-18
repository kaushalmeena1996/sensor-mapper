var app = angular.module('sensorApp');

app.controller('ViewLocationController', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.locationItem = {};
    $scope.locationItemLoaded = false;

    $scope.centreId = '';

    $scope.getCentreItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.locationItem = DataService.getNodeItem($scope.centreId);
                        $scope.locationItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    if ($scope.centreId == data.nodeItem.id) {
                        $scope.$parent.safeApply(function () {
                            $scope.locationItem = data.nodeItem;
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

    $scope.$on('$viewContentLoaded', function () {
        if ('location_id' in $location.search()) {
            $scope.centreId = $location.search().location_id;
            $scope.getCentreItem();
        } else {
            $scope.$parent.showDialog('Error', 'location_id was not found in the query parameters.')

            $location.url($scope.pageData.pd001.route);
        }
    });
});