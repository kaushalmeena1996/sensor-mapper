var app = angular.module('sensorApp');

app.controller('LoginController', function ($scope, $location, AUTH_EVENTS, STATUS_CODES, AuthService) {
    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.signIn = function () {
        $scope.$parent.showLoadingOverlay();

        AuthService.signIn($scope.credentials, $scope, AUTH_EVENTS.signIn, function (event, data) {
            $scope.safeApply(function () {
                $scope.$parent.hideLoadingOverlay();
            });

            switch (data.statusCode) {
                case STATUS_CODES.signInSuccessful:
                    $scope.$parent.showDialog('Error', 'Successfully logged in.');
                    $scope.safeApply(function () {
                        $location.url($scope.$parent.pageData.pd001.route);
                    });
                    break;
                case STATUS_CODES.signInFailed:
                    $scope.$parent.showDialog('Error', data.message)
                    break;
            }
        });
    };
});