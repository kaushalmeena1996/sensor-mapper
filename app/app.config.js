var app = angular.module('app');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('theme-home')
        .primaryPalette('blue-grey')
        .accentPalette('pink');

    $mdThemingProvider.theme('theme-map')
        .primaryPalette('deep-purple')
        .accentPalette('blue')

    $mdThemingProvider.theme('theme-search')
        .primaryPalette('purple')
        .accentPalette('red')

    $mdThemingProvider.theme('theme-route')
        .primaryPalette('indigo')
        .accentPalette('pink')

    $mdThemingProvider.theme('theme-view')
        .primaryPalette('blue')
        .accentPalette('red')

    $mdThemingProvider.theme('theme-about')
        .primaryPalette('green')
        .accentPalette('amber')

    $mdThemingProvider.theme('theme-login')
        .primaryPalette('teal')
        .accentPalette('red')

    $mdThemingProvider.alwaysWatchTheme(true);
});

app.config(function ($routeProvider, PAGE_DATA) {
    var routeProvider = $routeProvider;

    angular.forEach(PAGE_DATA, function (value, key) {
        routeProvider.when(value.route, {
            templateUrl: value.templateUrl,
            controller: value.controller,
            title: value.title,
            headerHidden: value.headerHidden,
            theme: value.theme
        });
    });

    routeProvider.otherwise({
        redirectTo: PAGE_DATA.pd001.route
    });
});