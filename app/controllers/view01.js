var app = angular.module('sensorApp');
var ref;

app.controller('ViewCentreCtrl', function ($scope, $location) {
    $scope.centreDetail = {};
    $scope.centreId = '';

    $scope.visible = false;

    $scope.getCentre = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes/centres/' + $scope.centreId);

        ref.on("value", function (snapshot) {
            var object = snapshot.val();

            $scope.$apply(function () {
                $scope.centreDetail = object;
                $scope.visible = true;
                $scope.$parent.hideLoadingOverlay();
            });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');

            $scope.$apply(function () {
                $scope.$parent.hideLoadingOverlay();
            });
        });
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('centre_id' in $location.search()) {
            $scope.centreId = $location.search().centre_id;
            $scope.getCentre();
        } else {
            Metro.infobox.create('centre_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});