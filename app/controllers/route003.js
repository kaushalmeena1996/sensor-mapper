var app = angular.module('app');

app.controller('RouteResultController', function ($scope, $location, PLOT_CODES, RouteService) {
    $scope.customRouteData = [];

    $scope.getCustomRouteData = function () {
        $scope.customRouteData = RouteService.getCustomRouteData();
    };

    $scope.plotRoute = function () {
        var link = $scope.$parent.pageData.pd002.route;

        link += '?plot_code=' + PLOT_CODES.route;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        switch (RouteService.getCustomRouteStep()) {
            case 1:
                $scope.$parent.showDialog('Error', 'Please complete step-1 first.');
                $location.url($scope.$parent.pageData.pd004.route);
                break;
            case 2:
                $scope.$parent.showDialog('Error', 'Please complete step-2 first.');
                $location.url($scope.$parent.pageData.pd005.route);
                break;
            case 3:
                $scope.getCustomRouteData();
                break;
        }
    });
});