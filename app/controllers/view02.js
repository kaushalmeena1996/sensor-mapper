var app = angular.module('sensorApp');

app.controller('ViewLocationCtrl', function ($scope, $location) {
    $scope.locationDetail = {};
    $scope.locationId = '';

    $scope.getLocation = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes/locations/' + $scope.locationId);

        ref.on("value", function (snapshot) {
            var object = snapshot.val();

            $scope.$apply(function () {
                $scope.locationDetail = object;
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
        if ('location_id' in $location.search()) {
            $scope.locationId = $location.search().location_id;
            $scope.getLocation();
        } else {
            Metro.infobox.create('location_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});