var app = angular.module('sensorApp');

app.controller('MainCtrl', function ($scope, PAGE_DETAILS) {
    $scope.pageLoading = false;

    $scope.pageDetails = PAGE_DETAILS;

    $scope.showLoadingOverlay = function () {
        $scope.pageLoading = true;
    };

    $scope.hideLoadingOverlay = function () {
        $scope.pageLoading = false;
    };

    $scope.safeApply = function (func) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (func && (typeof (func) === 'function')) {
                func();
            }
        } else {
            this.$apply(func);
        }
    };
});