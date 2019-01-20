var app = angular.module('sensorApp');

app.controller('RouteResultCtrl', function ($scope, $location, PLOT_CODES, RouteService) {
    $scope.customRouteData = [];

    $scope.getCustomRouteData = function () {
        $scope.customRouteData = RouteService.getCustomRouteData();
    };

    $scope.plotRoute = function () {
        $location.url('/map?action_code=' + PLOT_CODES.route);
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                Metro.infobox.create('<h5>Error</h5><span>Please select a centre first.</span>', 'warning');
                $location.url('/route/step-1');
                break;
            case 2:
                Metro.infobox.create('<h5>Error</h5><span>Please select a sensor first.</span>', 'warning');
                $location.url('/route/step-2');
                break;
            default:
                $scope.getCustomRouteData();
        }
    });
});