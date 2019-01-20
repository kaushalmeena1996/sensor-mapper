var app = angular.module('sensorApp');

app.controller('ViewCentreCtrl', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.centreItem = {};
    $scope.centreItemLoaded = false;

    $scope.centreId = '';

    $scope.getCentreItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.dataLoad, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccess:
                    $scope.$parent.safeApply(function () {
                        $scope.centreItem = DataService.getNodeItem($scope.centreId);
                        $scope.centreItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccess:
                    if (data.nodeItem.id == $scope.centreId) {
                        $scope.$parent.safeApply(function () {
                            $scope.centreItem = data.nodeItem;
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
        if ('centre_id' in $location.search()) {
            $scope.centreId = $location.search().centre_id;
            $scope.getCentreItem();
        } else {
            Metro.infobox.create('<h5>Error</h5><span>centre_id was not found in the query parameters.</span>', 'warning');
            $location.url('/home');
        }
    });
});