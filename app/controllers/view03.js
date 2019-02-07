var app = angular.module('sensorApp'),
    chart = null;

app.controller('ViewSensorController', function ($scope, $location, STATUS_CODES, SERVICE_EVENTS, DataService) {
    $scope.sensorItem = {};
    $scope.sensorItemLoaded = false;

    $scope.sensorId = '';

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
                    if ($scope.sensorId == data.nodeItem.id) {
                        $scope.$parent.safeApply(function () {
                            $scope.sensorItem = data.nodeItem;
                        });

                        if ($('#chartBox').data('infobox').isOpen() && chart) {
                            chart.data.datasets[0].data.push({
                                x: new Date(),
                                y: data.nodeItem.value
                            });

                            chart.update();
                        }
                    }
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
                case STATUS_CODES.dataUpdateFailed:
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
            }
        });
    };

    $scope.openSensorChart = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeChartData($scope.sensorId, $scope, SERVICE_EVENTS.chartData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    if (chart) {
                        chart.data.datasets[0].data = data.chartData
                        chart.update();
                    } else {
                        chart = new Chart($("#chartCanvas"), {
                            type: 'line',
                            data: {
                                datasets: [{
                                    data: data.chartData,
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
                                            labelString: $scope.sensorItem.reading.unit
                                        }
                                    }]
                                }
                            }
                        });
                    }

                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });

                    $('#chartBox').data('infobox').open();
                    break;
                case STATUS_CODES.dataLoadFailed:
                    $scope.$parent.safeApply(function () {
                        $scope.$parent.hideLoadingOverlay();
                    });
                    Metro.infobox.create('<h5>Error</h5><span>' + data.message + '.<span>', 'alert');
                    break;
            }
        });
    }

    $scope.$on('$viewContentLoaded', function () {
        if ('sensor_id' in $location.search()) {
            $scope.sensorId = $location.search().sensor_id;
            $scope.getSensorItem();
        } else {
            Metro.infobox.create('<h5>Error</h5><span>sensor_id was not found in the query parameters.<span>', 'warning');
            $location.url('/home');
        }
    });
});