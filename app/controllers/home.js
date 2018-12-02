var app = angular.module('sensorApp');

app.controller('HomeCtrl', function ($scope, PAGES) {
    $scope.pages = PAGES;
});