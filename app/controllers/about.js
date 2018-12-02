var app = angular.module('sensorApp');

app.controller('AboutCtrl', function ($scope, PAGES) {
    $scope.pages = PAGES;
});