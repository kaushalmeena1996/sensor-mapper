var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGES) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            title: PAGES.home.title,
            masterPage: PAGES.home.masterPage,
            data: PAGES.home.data
        })
        .when("/map", {
            templateUrl: "views/map.html",
            controller: "MapCtrl",
            title: PAGES.map.title,
            masterPage: PAGES.map.masterPage,
            data: PAGES.map.data
        })
        .when("/search", {
            templateUrl: "views/search.html",
            controller: "SearchCtrl",
            title: PAGES.search.title,
            masterPage: PAGES.search.masterPage,
            data: PAGES.search.data
        })
        .when("/view/centre", {
            templateUrl: "views/view01.html",
            controller: "ViewCentreCtrl",
            title: PAGES.view.title,
            masterPage: PAGES.view.masterPage,
            data: PAGES.view.data
        })
        .when("/view/location", {
            templateUrl: "views/view02.html",
            controller: "ViewLocationCtrl",
            title: PAGES.view.title,
            masterPage: PAGES.view.masterPage,
            data: PAGES.view.data

        })
        .when("/view/sensor", {
            templateUrl: "views/view03.html",
            controller: "ViewSensorCtrl",
            title: PAGES.view.title,
            masterPage: PAGES.view.masterPage,
            data: PAGES.view.data
        })
        .when("/route/step-1", {
            templateUrl: "views/route01.html",
            controller: "RouteCentreCtrl",
            title: PAGES.route.title,
            masterPage: PAGES.route.masterPage,
            data: PAGES.route.data
        })
        .when("/route/step-2", {
            templateUrl: "views/route02.html",
            controller: "RouteSensorCtrl",
            title: PAGES.route.title,
            masterPage: PAGES.route.masterPage,
            data: PAGES.route.data

        })
        .when("/route/result", {
            templateUrl: "views/route03.html",
            controller: "RouteResultCtrl",
            title: PAGES.route.title,
            masterPage: PAGES.route.masterPage,
            data: PAGES.route.data
        })
        .when("/about", {
            templateUrl: "views/about.html",
            title: PAGES.about.title,
            masterPage: PAGES.about.masterPage,
            data: PAGES.about.data
        })
        .when("/login", {
            templateUrl: "views/login.html",
            title: PAGES.login.title,
            masterPage: PAGES.login.masterPage,
            controller: "LoginCtrl",
            data: PAGES.login.data
        })
        .otherwise("/", {
            templateUrl: "views/home.html",
            title: PAGES.home.title,
            masterPage: PAGES.home.masterPage,
            data: PAGES.home.data
        });
});