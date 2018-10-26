var app = angular.module('sensorApp');

app.controller('RouteResultCtrl', function ($scope, $location, RouteService) {
    $scope.customRouteData = [];

    $scope.getCustomRouteData = function () {
        $scope.customRouteData = RouteService.getCustomRouteData();
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                Metro.infobox.create('Please select a centre first.', 'warning');
                $location.url('/route/step-1');
                break;
            case 2:
                Metro.infobox.create('Please select a sensor first.', 'warning');
                $location.url('/route/step-2');
                break;
            default:
                $scope.getCustomRouteData();
        }
    });
});