var app = angular.module('sensorApp', ['ngRoute', 'ngAnimate']);

app.run(function ($rootScope, $location, PAGE_DATA, AuthService) {
    /*
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.data != undefined) {
            if (AuthService.isSignedIn()) {
                if (next.title == PAGE_DATA.pd007.title) {
                    Metro.infobox.create('<h5>Info</h5><span>You are already logged in.</span>', 'default');
                    $location.url('/');
                }
            } else {
                if (next.title != PAGE_DATA.pd007.title) {
                    Metro.infobox.create('<h5>Info</h5><span>You are need to be logged in to access that page.</span>', 'default');
                    $location.url('/login');
                }
            }
        }
    });
    */
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
            $rootScope.masterPage = current.$$route.masterPage;
            $rootScope.bgColor = current.$$route.data.bgColor.normal;
        }
    });
});