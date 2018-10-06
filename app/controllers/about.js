var app = angular.module('sensorApp');

app.controller('AboutCtrl', function ($scope, PAGE_DETAILS) {
    $scope.pageDetails = PAGE_DETAILS;
});