var app = angular.module('sensorApp');

app.controller('ViewSensorCtrl', function ($scope, $location) {
    $scope.sensorDetail = {};
    $scope.sensorId = '';

    $scope.visible = true;

    $scope.getSensor = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes/sensors/' + $scope.sensorId);

        ref.on("value", function (snapshot) {
            var object = snapshot.val();

            $scope.$apply(function () {
                $scope.sensorDetail = object;
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
        if ('sensor_id' in $location.search()) {
            $scope.sensorId = $location.search().sensor_id;
            $scope.getSensor();
        } else {
            Metro.infobox.create('sensor_id was not found in the query parameters.', 'warning');
            $location.url('/home');
        }
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});