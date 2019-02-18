var app = angular.module('sensorApp');

app.config(function ($routeProvider, PAGE_DATA) {
    $routeProvider
        .when(PAGE_DATA.pd001.route, {
            templateUrl: PAGE_DATA.pd001.templateUrl,
            controller: PAGE_DATA.pd001.controller,
            title: PAGE_DATA.pd001.title,
            headerHidden: PAGE_DATA.pd001.headerHidden,
            theme: PAGE_DATA.pd001.theme
        })
        .when(PAGE_DATA.pd002.route, {
            templateUrl: PAGE_DATA.pd002.templateUrl,
            controller: PAGE_DATA.pd002.controller,
            title: PAGE_DATA.pd002.title,
            headerHidden: PAGE_DATA.pd002.headerHidden,
            theme: PAGE_DATA.pd002.theme
        })
        .when(PAGE_DATA.pd003.route, {
            templateUrl: PAGE_DATA.pd003.templateUrl,
            controller: PAGE_DATA.pd003.controller,
            title: PAGE_DATA.pd003.title,
            headerHidden: PAGE_DATA.pd003.headerHidden,
            theme: PAGE_DATA.pd003.theme
        })
        .when(PAGE_DATA.pd004.route, {
            templateUrl: PAGE_DATA.pd004.templateUrl,
            controller: PAGE_DATA.pd004.controller,
            title: PAGE_DATA.pd004.title,
            headerHidden: PAGE_DATA.pd004.headerHidden,
            theme: PAGE_DATA.pd004.theme
        })
        .when(PAGE_DATA.pd005.route, {
            templateUrl: PAGE_DATA.pd005.templateUrl,
            controller: PAGE_DATA.pd005.controller,
            title: PAGE_DATA.pd005.title,
            headerHidden: PAGE_DATA.pd005.headerHidden,
            theme: PAGE_DATA.pd005.theme
        })
        .when(PAGE_DATA.pd006.route, {
            templateUrl: PAGE_DATA.pd006.templateUrl,
            controller: PAGE_DATA.pd006.controller,
            title: PAGE_DATA.pd006.title,
            headerHidden: PAGE_DATA.pd006.headerHidden,
            theme: PAGE_DATA.pd006.theme
        })
        .when(PAGE_DATA.pd007.route, {
            templateUrl: PAGE_DATA.pd007.templateUrl,
            controller: PAGE_DATA.pd007.controller,
            title: PAGE_DATA.pd007.title,
            headerHidden: PAGE_DATA.pd007.headerHidden,
            theme: PAGE_DATA.pd007.theme
        })
        .when(PAGE_DATA.pd008.route, {
            templateUrl: PAGE_DATA.pd008.templateUrl,
            controller: PAGE_DATA.pd008.controller,
            title: PAGE_DATA.pd008.title,
            headerHidden: PAGE_DATA.pd008.headerHidden,
            theme: PAGE_DATA.pd008.theme
        })
        .when(PAGE_DATA.pd009.route, {
            templateUrl: PAGE_DATA.pd009.templateUrl,
            controller: PAGE_DATA.pd009.controller,
            title: PAGE_DATA.pd009.title,
            headerHidden: PAGE_DATA.pd009.headerHidden,
            theme: PAGE_DATA.pd009.theme
        })
        .when(PAGE_DATA.pd010.route, {
            templateUrl: PAGE_DATA.pd010.templateUrl,
            controller: PAGE_DATA.pd010.controller,
            title: PAGE_DATA.pd010.title,
            headerHidden: PAGE_DATA.pd010.headerHidden,
            theme: PAGE_DATA.pd010.theme
        })
        .when(PAGE_DATA.pd011.route, {
            templateUrl: PAGE_DATA.pd011.templateUrl,
            controller: PAGE_DATA.pd011.controller,
            title: PAGE_DATA.pd011.title,
            headerHidden: PAGE_DATA.pd011.headerHidden,
            theme: PAGE_DATA.pd011.theme
        })
        .when(PAGE_DATA.pd012.route, {
            templateUrl: PAGE_DATA.pd012.templateUrl,
            controller: PAGE_DATA.pd012.controller,
            title: PAGE_DATA.pd012.title,
            headerHidden: PAGE_DATA.pd012.headerHidden,
            theme: PAGE_DATA.pd012.theme
        })
        .otherwise({
            redirectTo: PAGE_DATA.pd001.route
        });
});