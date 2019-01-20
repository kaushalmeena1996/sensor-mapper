var app = angular.module('sensorApp');

app.controller('LoginCtrl', function ($scope) {
    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.signIn = function () {
        $scope.$parent.signIn($scope.credentials);
    };
});