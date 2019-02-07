var app = angular.module('sensorApp');

app.controller('SearchController', function ($scope, $location, $filter, MAP_CATEGORIES, CATEGORY_TYPES, CENTRE_TYPES, LOCATION_TYPES, SENSOR_TYPES, CENTRE_STATUS_TYPES, LOCATION_STATUS_TYPES, SENSOR_STATUS_TYPES, STATUS_CODES, PLOT_CODES, SERVICE_EVENTS, PagerService, DataService) {
    $scope.tableData = [];

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';
    $scope.filter3 = '*';

    $scope.categories = MAP_CATEGORIES;
    $scope.categoryTypes = CATEGORY_TYPES;
    $scope.centreTypes = CENTRE_TYPES;
    $scope.locationTypes = LOCATION_TYPES;
    $scope.sensorTypes = SENSOR_TYPES;
    $scope.centreStatusTypes = CENTRE_STATUS_TYPES;
    $scope.locationStatusTypes = LOCATION_STATUS_TYPES;
    $scope.sensorStatusTypes = SENSOR_STATUS_TYPES;

    $scope.pager = {
        totalItems: 1,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        startPage: 1,
        endPage: 1,
        startIndex: 0,
        endIndex: 0,
        pages: []
    };

    $scope.getNodeData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.changePage(1);
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    var index = $scope.tableData.findIndex(
                        function (tableItem) {
                            return tableItem.id == data.nodeItem.id;
                        }
                    );

                    if (index > -1) {
                        $scope.$parent.safeApply(function () {
                            $scope.tableData[index] = data.nodeItem;
                        });
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

    $scope.changePage = function (page) {
        var nodeData = DataService.getNodeData();

        if ($scope.query) {
            nodeData = $filter('filter')(nodeData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                category: $scope.filter1
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                type: { name: $scope.filter2 }
            }, true);
        }

        if ($scope.filter3 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                status: { name: $scope.filter3 }
            }, true);
        }

        $scope.pager = PagerService.generatePager(nodeData.length, page);
        nodeData = nodeData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
        $scope.tableData = nodeData;
    };

    $scope.setFilter1 = function (value) {
        $scope.filter1 = value;
        $scope.changePage(1);
    };

    $scope.setFilter2 = function (value) {
        $scope.filter2 = value;
        $scope.changePage(1);
    };

    $scope.setFilter3 = function (value) {
        $scope.filter3 = value;
        $scope.changePage(1);
    };

    $scope.plotNodeItem = function (id) {
        $location.url('/map?plot_code=' + PLOT_CODES.nodeItem + '&node_id=' + id);
    };

    $scope.showNodeItem = function (id, category) {
        var link = '/view',
            category = category.toLowerCase();

        link += '/' + category;
        link += '?' + category + '_id=' + id;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.getNodeData();
    });
});