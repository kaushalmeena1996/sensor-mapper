var app = angular.module('sensorApp');

app.controller('MainCtrl', function ($scope, $location, PAGE_DATA, AUTH_EVENTS, STATUS_CODES, AuthService) {
    $scope.pageLoading = false;

    $scope.pages = PAGE_DATA;

    $scope.showLoadingOverlay = function () {
        $scope.pageLoading = true;
    };

    $scope.hideLoadingOverlay = function () {
        $scope.pageLoading = false;
    };

    $scope.signIn = function (credentials) {
        $scope.showLoadingOverlay();

        AuthService.signIn(credentials, $scope, AUTH_EVENTS.signIn, function (event, data) {
            $scope.safeApply(function () {
                $scope.hideLoadingOverlay();
            });

            switch (data.statusCode) {
                case STATUS_CODES.signInSuccess:
                    Metro.toast.create("Successfully logged in.", null, 5000, "bg-green fg-white");
                    $scope.safeApply(function () {
                        $location.url('/');
                    });
                    break;
                case STATUS_CODES.signInFailed:
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.</span>', 'alert');
                    break;
            }
        });
    };

    $scope.signOut = function () {
        $scope.showLoadingOverlay();

        AuthService.signOut($scope, AUTH_EVENTS.signOut, function (event, data) {
            $scope.safeApply(function () {
                $scope.hideLoadingOverlay();
            });

            switch (data.statusCode) {
                case STATUS_CODES.signOutSuccess:
                    Metro.toast.create("Successfully logged out.", null, 5000, "bg-green fg-white");
                    $scope.safeApply(function () {
                        $location.url('/login');
                    });
                    break;
                case STATUS_CODES.signOutFailed:
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.</span>', 'alert');
                    break;
            }
        });
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