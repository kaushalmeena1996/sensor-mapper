var app = angular.module('sensorApp');

app.controller('ViewCentreController', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.centreItem = {};
    $scope.centreItemLoaded = false;

    $scope.centreId = '';

    $scope.getCentreItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.centreItem = DataService.getNodeItem($scope.centreId);
                        $scope.centreItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    var nodeIndex = data.updatedNodeIds.findIndex(
                        function (nodeId) {
                            return $scope.centreId == nodeId;
                        }
                    );

                    if (nodeIndex > -1) {
                        $scope.$parent.safeApply(function () {
                            $scope.centreItem = DataService.getNodeItem(data.updatedNodeIds[nodeIndex]);
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
        if ('centre_id' in $location.search()) {
            $scope.centreId = $location.search().centre_id;
            $scope.getCentreItem();
        } else {
            $scope.$parent.showDialog('Error', 'centre_id was not found in the query parameters.');
            $location.url($scope.pageData.pd001.route);
        }
    });
});