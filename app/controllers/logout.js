var app = angular.module('app');

app.controller('LogoutController', function ($scope, $location, AUTH_EVENTS, STATUS_CODES, AuthService) {
    $scope.signOut = function () {
        $scope.showLoadingOverlay();

        AuthService.signOut($scope, AUTH_EVENTS.signOut, function (event, data) {
            $scope.safeApply(function () {
                $scope.hideLoadingOverlay();
            });

            switch (data.statusCode) {
                case STATUS_CODES.signOutSuccessful:
                    $scope.$parent.showToast(['Successfully logged out.'], 3000);
                    $scope.safeApply(function () {
                        $location.url($scope.$parent.pageData.pd011.route);
                    });
                    break;
                case STATUS_CODES.signOutFailed:
                    $scope.$parent.showDialog('Error', data.message);
                    break;
            }
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.signOut();
    });
});