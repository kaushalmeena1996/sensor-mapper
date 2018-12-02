var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGES) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "HomeCtrl",
            title: PAGES.home.title,
            data: PAGES.home.data
        })
        .when("/map", {
            templateUrl: "views/map.html",
            controller: "MapCtrl",
            title: PAGES.map.title,
            data: PAGES.map.data
        })
        .when("/search", {
            templateUrl: "views/search.html",
            controller: "SearchCtrl",
            title: PAGES.search.title,
            data: PAGES.search.data
        })
        .when("/view/centre", {
            templateUrl: "views/view01.html",
            controller: "ViewCentreCtrl",
            title: PAGES.view.title,
            data: PAGES.view.data
        })
        .when("/view/location", {
            templateUrl: "views/view02.html",
            controller: "ViewLocationCtrl",
            title: PAGES.view.title,
            data: PAGES.view.data

        })
        .when("/view/sensor", {
            templateUrl: "views/view03.html",
            controller: "ViewSensorCtrl",
            title: PAGES.view.title,
            data: PAGES.view.data
        })
        .when("/route/step-1", {
            templateUrl: "views/route01.html",
            controller: "RouteCentreCtrl",
            title: PAGES.route.title,
            data: PAGES.route.data
        })
        .when("/route/step-2", {
            templateUrl: "views/route02.html",
            controller: "RouteSensorCtrl",
            title: PAGES.route.title,
            data: PAGES.route.data

        })
        .when("/route/result", {
            templateUrl: "views/route03.html",
            controller: "RouteResultCtrl",
            title: PAGES.route.title,
            data: PAGES.route.data
        })
        .when("/about", {
            templateUrl: "views/about.html",
            title: PAGES.about.title,
            controller: "AboutCtrl",
            data: PAGES.about.data
        })
        .otherwise("/", {
            templateUrl: "views/home.html",
            controller: "HomeCtrl",
            title: PAGES.home.title,
            data: PAGES.home.data
        });
});