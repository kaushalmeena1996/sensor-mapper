var app = angular.module('app');

app.controller('SearchController', function ($scope, $location, $filter, MAP_CATEGORIES, CATEGORY_TYPES, CENTRE_TYPES, LOCATION_TYPES, SENSOR_TYPES, CENTRE_STATUS_TYPES, LOCATION_STATUS_TYPES, SENSOR_STATUS_TYPES, STATUS_CODES, PLOT_CODES, SERVICE_EVENTS, DataService) {
    $scope.tableData = [];

    $scope.query = '';

    $scope.filter1 = '*';
    $scope.filter2 = '*';
    $scope.filter3 = '*';

    $scope.categoryTypes = CATEGORY_TYPES;
    $scope.centreTypes = CENTRE_TYPES;
    $scope.locationTypes = LOCATION_TYPES;
    $scope.sensorTypes = SENSOR_TYPES;
    $scope.centreStatusTypes = CENTRE_STATUS_TYPES;
    $scope.locationStatusTypes = LOCATION_STATUS_TYPES;
    $scope.sensorStatusTypes = SENSOR_STATUS_TYPES;

    $scope.getNodeData = function () {
        $scope.$parent.showLoadingOverlay();

        DataService.subscribeNodeData($scope, SERVICE_EVENTS.nodeData, function (event, data) {
            switch (data.statusCode) {
                case STATUS_CODES.dataLoadSuccessful:
                    $scope.$parent.safeApply(function () {
                        $scope.applyFilter();
                        $scope.$parent.hideLoadingOverlay();
                    });
                    break;
                case STATUS_CODES.dataUpdateSuccessful:
                    var tableData = $scope.tableData,
                        tableDataUpdated = false,
                        nodeIndex,
                        nodeItem,
                        i;

                    for (i = 0; i < data.updatedNodeIds.length; i++) {
                        nodeIndex = tableData.findIndex(
                            function (tableItem) {
                                return tableItem.id == data.updatedNodeIds[i];
                            }
                        );

                        if (nodeIndex > -1) {
                            nodeItem = DataService.getNodeItem(data.updatedNodeIds[i]);

                            if (tableData[nodeIndex].status.id != nodeItem.status.id) {
                                tableData[nodeIndex] = nodeItem;
                                tableDataUpdated = true;
                            }
                        }
                    }

                    if (tableDataUpdated) {
                        $scope.$parent.safeApply(function () {
                            $scope.tableData = tableData;
                        });
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

    $scope.applyFilter = function () {
        var nodeData = DataService.getNodeData();

        if ($scope.query) {
            nodeData = $filter('filter')(nodeData, {
                name: $scope.query
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                category: { id: $scope.filter1 }
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                type: { id: $scope.filter2 }
            }, true);
        }

        if ($scope.filter3 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                status: { id: $scope.filter3 }
            }, true);
        }

        $scope.tableData = nodeData;
    };

    $scope.plotNodeItem = function (id) {
        var link = $scope.$parent.pageData.pd002.route;

        link += '?plot_code=' + PLOT_CODES.nodeItem + '&node_id=' + id;

        $location.url(link);
    };

    $scope.showNodeItem = function (nodeId, categoryId) {
        var categoryName = '',
            link = '';

        switch (categoryId) {
            case 'c001':
                categoryName = MAP_CATEGORIES.c001.name;
                link = $scope.$parent.pageData.pd007.route;
                break;
            case 'c002':
                categoryName = MAP_CATEGORIES.c002.name;
                link = $scope.$parent.pageData.pd008.route;
                break;
            case 'c003':
                categoryName = MAP_CATEGORIES.c003.name;
                link = $scope.$parent.pageData.pd009.route;
                break;
        }

        categoryName = categoryName.toLowerCase();

        link += '?' + categoryName + '_id=' + nodeId;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.getNodeData();
    });
});