var app = angular.module('app');

app.controller('MainController', function ($scope, $mdToast, $mdDialog, PAGE_DATA, IMAGE_DATA, DataService) {
    $scope.pageLoading = false;

    $scope.pageData = PAGE_DATA;
    $scope.imageData = IMAGE_DATA;

    $scope.showLoadingOverlay = function () {
        $scope.pageLoading = true;
    };

    $scope.hideLoadingOverlay = function () {
        $scope.pageLoading = false;
    };

    $scope.showMenu = function ($mdMenu, event) {
        $mdMenu.open(event);
    };

    $scope.showToast = function (messages, delay) {
        var html = '',
            i;

        html += '<ul>';

        for (i = 0; i < messages.length; i++) {
            html += '<li>' + messages[i] + '</li>';
        }

        html += '</ul>';

        $mdToast.show({
            template: '<md-toast aria-label="Alert-Toast"><div class="md-toast-text">' + html + '</div></md-toast>',
            hideDelay: delay,
            position: 'top right'
        });
    };

    $scope.showDialog = function (title, message) {
        $mdDialog.show({
            template: '<md-dialog aria-label="Alert-Dialog"><md-dialog-content><div class="md-dialog-content"><div layout="row" layout-align="space-between center"><span class="md-title">' + title + '</span><md-button class="md-icon-button" aria-label="Close-Button" data-ng-click="hideDialog()"><md-icon>close</md-icon></md-button></div><p>' + message + '</p></div></md-dialog-content></md-dialog>',
            controller: function ($scope, $mdDialog) {
                $scope.hideDialog = function () {
                    $mdDialog.hide();
                };
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
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