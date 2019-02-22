var app = angular.module('sensorApp');

app.controller('ViewSensorController', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.sensorItem = {};
    $scope.sensorItemLoaded = false;

    $scope.sensorId = '';

    $scope.chartData = {};
    $scope.chartDialogVisible = false;

    $scope.getSensorItem = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.sensorItem = DataService.getNodeItem($scope.sensorId);
                        $scope.sensorItemLoaded = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    var nodeIndex = data.updatedNodeIds.findIndex(
                        function (nodeId) {
                            return $scope.sensorId == nodeId;
                        }
                    );

                    if (nodeIndex > -1) {
                        $scope.$parent.safeApply(function () {
                            $scope.sensorItem = DataService.getNodeItem(data.updatedNodeIds[nodeIndex]);
                        });

                        if ($scope.chartDialogVisible) {
                            $scope.chartData.data.datasets[0].data.push({
                                x: new Date(),
                                y: data.nodeItem.value
                            });

                            $scope.chartData.update();
                        }
                    }
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    $scope.$parent.showDialog('Error', data.message);
                    break;
                case STATUS_CODES.dataUpdateFailed:
                    $scope.$parent.showDialog('Error', data.message);
                    break;
            }
        });
    };

    $scope.showChartDialog = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeChartData($scope.sensorId, $scope, SERVICE_EVENTS.chartData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.chartData.data.datasets[0].data = data.chartData
                    $scope.chartData.update();

                    $scope.$parent.safeApply(function () {
                        $scope.chartDialogVisible = true;
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.showDialog('Error', data.message);

                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
            }
        });
    }

    $scope.hideChartDialog = function () {
        $scope.chartDialogVisible = false;
    };

    $scope.$on('$viewContentLoaded', function () {
        if ('sensor_id' in $location.search()) {
            $scope.sensorId = $location.search().sensor_id;

            $scope.chartData = new Chart(document.querySelector(".chart-canvas").getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        data: [],
                        borderColor: 'rgba(255,99,132,1)',
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 10
                    }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItems, data) {
                                return tooltipItems.yLabel + ' ' + $scope.sensorItem.reading.unit;
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            scaleLabel: {
                                display: true,
                                labelString: 'Time'
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Reading'
                            }
                        }]
                    }
                }
            });

            $scope.getSensorItem();
        } else {
            $scope.$parent.showDialog('Error', 'sensor_id was not found in the query parameters.');
            $location.url($scope.pageData.pd001.route);
        }
    });
});