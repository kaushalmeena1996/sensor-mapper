var app = angular.module('sensorApp');
var activity = null;

app.controller('MainCtrl', function ($scope, PAGE_DETAILS) {
    $scope.pageDetails = PAGE_DETAILS;
    
    $scope.showLoadingOverlay = function () {
        activity = Metro.activity.open({
            type: 'square',
            style: 'black'
        });
    };

    $scope.hideLoadingOverlay = function () {
        Metro.activity.close(activity);
    };
});