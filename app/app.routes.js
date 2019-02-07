var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGE_DATA) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            title: PAGE_DATA.pd001.title,
            masterPage: PAGE_DATA.pd001.masterPage,
            data: PAGE_DATA.pd001.data
        })
        .when("/map", {
            templateUrl: "views/map.html",
            controller: "MapController",
            title: PAGE_DATA.pd002.title,
            masterPage: PAGE_DATA.pd002.masterPage,
            data: PAGE_DATA.pd002.data
        })
        .when("/search", {
            templateUrl: "views/search.html",
            controller: "SearchController",
            title: PAGE_DATA.pd003.title,
            masterPage: PAGE_DATA.pd003.masterPage,
            data: PAGE_DATA.pd003.data
        })
        .when("/view/centre", {
            templateUrl: "views/view01.html",
            controller: "ViewCentreController",
            title: PAGE_DATA.pd005.title,
            masterPage: PAGE_DATA.pd005.masterPage,
            data: PAGE_DATA.pd005.data
        })
        .when("/view/location", {
            templateUrl: "views/view02.html",
            controller: "ViewLocationController",
            title: PAGE_DATA.pd005.title,
            masterPage: PAGE_DATA.pd005.masterPage,
            data: PAGE_DATA.pd005.data

        })
        .when("/view/sensor", {
            templateUrl: "views/view03.html",
            controller: "ViewSensorController",
            title: PAGE_DATA.pd005.title,
            masterPage: PAGE_DATA.pd005.masterPage,
            data: PAGE_DATA.pd005.data
        })
        .when("/route/step-1", {
            templateUrl: "views/route01.html",
            controller: "RouteCentreController",
            title: PAGE_DATA.pd004.title,
            masterPage: PAGE_DATA.pd004.masterPage,
            data: PAGE_DATA.pd004.data
        })
        .when("/route/step-2", {
            templateUrl: "views/route02.html",
            controller: "RouteSensorController",
            title: PAGE_DATA.pd004.title,
            masterPage: PAGE_DATA.pd004.masterPage,
            data: PAGE_DATA.pd004.data

        })
        .when("/route/result", {
            templateUrl: "views/route03.html",
            controller: "RouteResultController",
            title: PAGE_DATA.pd004.title,
            masterPage: PAGE_DATA.pd004.masterPage,
            data: PAGE_DATA.pd004.data
        })
        .when("/about", {
            templateUrl: "views/about.html",
            title: PAGE_DATA.pd006.title,
            masterPage: PAGE_DATA.pd006.masterPage,
            data: PAGE_DATA.pd006.data
        })
        .when("/login", {
            templateUrl: "views/login.html",
            title: PAGE_DATA.pd007.title,
            masterPage: PAGE_DATA.pd007.masterPage,
            controller: "LoginController",
            data: PAGE_DATA.pd007.data
        })
        .otherwise("/", {
            templateUrl: "views/home.html",
            title: PAGE_DATA.pd001.title,
            masterPage: PAGE_DATA.pd001.masterPage,
            data: PAGE_DATA.pd001.data
        });
});