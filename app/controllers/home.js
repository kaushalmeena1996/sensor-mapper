var app = angular.module('sensorApp');

app.controller('HomeCtrl', function ($scope, PAGE_DETAILS) {
    $scope.pageDetails = PAGE_DETAILS;
});