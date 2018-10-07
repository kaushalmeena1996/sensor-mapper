var app = angular.module('sensorApp');

app.controller('ViewCentreCtrl', function ($scope, $location, SERVICE_EVENTS, DataService) {
    $scope.centreDetail = {};
    $scope.centreId = '';

    $scope.divisionVisible = false;

    $scope.getCentreDetail = function () {
        $scope.$parent.showLoadingOverlay();

        if (DataService.isNodeDataLoaded()) {
            $scope.centreDetail = DataService.getCentreDetail($scope.centreId);
            $scope.divisionVisible = true;
            $scope.$parent.hideLoadingOverlay();
        } else {
            DataService.fetchNodeData();

            DataService.subscribe($scope, SERVICE_EVENTS.nodeDataChanged, function () {
                $scope.$apply(function () {
                    $scope.centreDetail = DataService.getCentreDetail($scope.centreId);
                    $scope.divisionVisible = true;
                    $scope.$parent.hideLoadingOverlay();
                });
            });
        }
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('centre_id' in $location.search()) {
            $scope.centreId = $location.search().centre_id;
            $scope.getCentreDetail();
        } else {
            Metro.infobox.create('centre_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });
});