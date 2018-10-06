var app = angular.module('sensorApp', ['ngRoute', 'ngAnimate']);

app.run(function ($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
            $rootScope.bgColor = current.$$route.data.bgColor.normal;
        }
    });
});