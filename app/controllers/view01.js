var app = angular.module('sensorApp');

app.controller('ViewCentreCtrl', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.centreItem = {};
    $scope.centreItemLoaded = false;

    $scope.centreId = '';

    $scope.getCentreItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeDataChanged, function (event, data) {
            switch (data.changeCode) {
                case STATUS_CODES.dataLoaded:
                    $scope.$parent.safeApply(function () {
                        $scope.centreItem = DataService.getNodeItem($scope.centreId);
                        $scope.centreItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdated:
                    if (data.nodeItem.id == $scope.centreId) {
                        $scope.$parent.safeApply(function () {
                            $scope.centreItem = data.nodeItem;
                        });
                    }
                    break;
            }
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('centre_id' in $location.search()) {
            $scope.centreId = $location.search().centre_id;
            $scope.getCentreItem();
        } else {
            Metro.infobox.create('centre_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});