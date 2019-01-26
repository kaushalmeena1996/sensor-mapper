var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGE_DATA) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            title: PAGE_DATA.home.title,
            masterPage: PAGE_DATA.home.masterPage,
            data: PAGE_DATA.home.data
        })
        .when("/map", {
            templateUrl: "views/map.html",
            controller: "MapCtrl",
            title: PAGE_DATA.map.title,
            masterPage: PAGE_DATA.map.masterPage,
            data: PAGE_DATA.map.data
        })
        .when("/search", {
            templateUrl: "views/search.html",
            controller: "SearchCtrl",
            title: PAGE_DATA.search.title,
            masterPage: PAGE_DATA.search.masterPage,
            data: PAGE_DATA.search.data
        })
        .when("/view/centre", {
            templateUrl: "views/view01.html",
            controller: "ViewCentreCtrl",
            title: PAGE_DATA.view.title,
            masterPage: PAGE_DATA.view.masterPage,
            data: PAGE_DATA.view.data
        })
        .when("/view/location", {
            templateUrl: "views/view02.html",
            controller: "ViewLocationCtrl",
            title: PAGE_DATA.view.title,
            masterPage: PAGE_DATA.view.masterPage,
            data: PAGE_DATA.view.data

        })
        .when("/view/sensor", {
            templateUrl: "views/view03.html",
            controller: "ViewSensorCtrl",
            title: PAGE_DATA.view.title,
            masterPage: PAGE_DATA.view.masterPage,
            data: PAGE_DATA.view.data
        })
        .when("/route/step-1", {
            templateUrl: "views/route01.html",
            controller: "RouteCentreCtrl",
            title: PAGE_DATA.route.title,
            masterPage: PAGE_DATA.route.masterPage,
            data: PAGE_DATA.route.data
        })
        .when("/route/step-2", {
            templateUrl: "views/route02.html",
            controller: "RouteSensorCtrl",
            title: PAGE_DATA.route.title,
            masterPage: PAGE_DATA.route.masterPage,
            data: PAGE_DATA.route.data

        })
        .when("/route/result", {
            templateUrl: "views/route03.html",
            controller: "RouteResultCtrl",
            title: PAGE_DATA.route.title,
            masterPage: PAGE_DATA.route.masterPage,
            data: PAGE_DATA.route.data
        })
        .when("/about", {
            templateUrl: "views/about.html",
            title: PAGE_DATA.about.title,
            masterPage: PAGE_DATA.about.masterPage,
            data: PAGE_DATA.about.data
        })
        .when("/login", {
            templateUrl: "views/login.html",
            title: PAGE_DATA.login.title,
            masterPage: PAGE_DATA.login.masterPage,
            controller: "LoginCtrl",
            data: PAGE_DATA.login.data
        })
        .otherwise("/", {
            templateUrl: "views/home.html",
            title: PAGE_DATA.home.title,
            masterPage: PAGE_DATA.home.masterPage,
            data: PAGE_DATA.home.data
        });
});