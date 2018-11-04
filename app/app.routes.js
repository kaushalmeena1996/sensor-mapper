var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGE_DETAILS) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "HomeCtrl",
            title: PAGE_DETAILS.home.title,
            data: PAGE_DETAILS.home.data
        })
        .when("/map", {
            templateUrl: "views/map.html",
            controller: "MapCtrl",
            title: PAGE_DETAILS.map.title,
            data: PAGE_DETAILS.map.data
        })
        .when("/search", {
            templateUrl: "views/search.html",
            controller: "SearchCtrl",
            title: PAGE_DETAILS.search.title,
            data: PAGE_DETAILS.search.data
        })
        .when("/view/centre", {
            templateUrl: "views/view01.html",
            controller: "ViewCentreCtrl",
            title: PAGE_DETAILS.view.title,
            data: PAGE_DETAILS.view.data
        })
        .when("/view/location", {
            templateUrl: "views/view02.html",
            controller: "ViewLocationCtrl",
            title: PAGE_DETAILS.view.title,
            data: PAGE_DETAILS.view.data

        })
        .when("/view/sensor", {
            templateUrl: "views/view03.html",
            controller: "ViewSensorCtrl",
            title: PAGE_DETAILS.view.title,
            data: PAGE_DETAILS.view.data
        })
        .when("/route/step-1", {
            templateUrl: "views/route01.html",
            controller: "RouteCentreCtrl",
            title: PAGE_DETAILS.route.title,
            data: PAGE_DETAILS.route.data
        })
        .when("/route/step-2", {
            templateUrl: "views/route02.html",
            controller: "RouteSensorCtrl",
            title: PAGE_DETAILS.route.title,
            data: PAGE_DETAILS.route.data

        })
        .when("/route/result", {
            templateUrl: "views/route03.html",
            controller: "RouteResultCtrl",
            title: PAGE_DETAILS.route.title,
            data: PAGE_DETAILS.route.data
        })
        .when("/about", {
            templateUrl: "views/about.html",
            title: PAGE_DETAILS.about.title,
            controller: "AboutCtrl",
            data: PAGE_DETAILS.about.data
        })
        .otherwise("/", {
            templateUrl: "views/home.html",
            controller: "HomeCtrl",
            title: PAGE_DETAILS.home.title,
            data: PAGE_DETAILS.home.data
        });
});