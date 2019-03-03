var app = angular.module('sensorApp', ['ngRoute', 'ngAnimate', 'ngMaterial', 'ngMessages', 'ngSanitize', 'ngAria']);

app.run(function ($rootScope, $mdDialog, $location, PAGE_DATA, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (AuthService.signedIn()) {
            if (next.title == PAGE_DATA.pd007.title) {
                $mdDialog.show({
                    template: '<md-dialog aria-label="Alert-Dialog"><md-dialog-content><div class="md-dialog-content"><div layout="row" layout-align="space-between center"><span class="md-title">Information</span><md-button class="md-icon-button" data-ng-click="hideDialog()"><md-icon>close</md-icon></md-button></div><p>You are already logged in.</p></div></md-dialog-content></md-dialog>',
                    controller: function ($scope, $mdDialog) {
                        $scope.hideDialog = function () {
                            $mdDialog.hide();
                        };
                    },
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });

                $location.url(PAGE_DATA.pd001.route);
            }
        } else {
            if (next.title != PAGE_DATA.pd007.title) {
                $mdDialog.show({
                    template: '<md-dialog aria-label="Alert-Dialog"><md-dialog-content><div class="md-dialog-content"><div layout="row" layout-align="space-between center"><span class="md-title">Information</span><md-button class="md-icon-button" data-ng-click="hideDialog()"><md-icon>close</md-icon></md-button></div><p>You are need to be logged in to access that page.</p></div></md-dialog-content></md-dialog>',
                    controller: function ($scope, $mdDialog) {
                        $scope.hideDialog = function () {
                            $mdDialog.hide();
                        };
                    },
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });

                $location.url(PAGE_DATA.pd011.route);
            }
        }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
            $rootScope.headerHidden = current.$$route.headerHidden;
            $rootScope.theme = current.$$route.theme;
        }
    });
});