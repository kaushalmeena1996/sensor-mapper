var app = angular.module('sensorApp');
var ref;

app.controller('SearchCtrl', function ($scope, $location, $filter, MAP_CATEGORIES, CATEGORY_TYPES, CENTRE_TYPES, LOCATION_TYPES, SENSOR_TYPES, STATUS_TYPES, PagerService) {
    $scope.nodeData = [];
    $scope.tableData = [];

    $scope.filter1 = '*';
    $scope.filter2 = '*';
    $scope.filter3 = '*';

    $scope.categories = MAP_CATEGORIES;
    $scope.categoryTypes = CATEGORY_TYPES;
    $scope.centreTypes = CENTRE_TYPES;
    $scope.locationTypes = LOCATION_TYPES;
    $scope.sensorTypes = SENSOR_TYPES;
    $scope.statusTypes = STATUS_TYPES;

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

    $scope.getNodes = function () {
        $scope.$parent.showLoadingOverlay();

        ref = firebase.database().ref().child('nodes');

        ref.on("value", function (snapshot) {
            var object = snapshot.val(),
                data = [];

            angular.forEach(object.centres, function (item) {
                data.push(item);
            });
            angular.forEach(object.locations, function (item) {
                data.push(item);
            });
            angular.forEach(object.sensors, function (item) {
                data.push(item);
            });

            $scope.$apply(function () {
                $scope.nodeData = data;
                $scope.changePage(1);
                $scope.$parent.hideLoadingOverlay();
            });
        }, function (error) {
            Metro.infobox.create('' + error + '', 'alert');

            $scope.$apply(function () {
                $scope.$parent.hideLoadingOverlay();
            });
        });
    };

    $scope.changePage = function (page) {
        var nodeData = $scope.nodeData;

        if ($scope.search) {
            nodeData = $filter('filter')(nodeData, {
                'name': $scope.search
            });
        }

        if ($scope.filter1 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                'category': $scope.filter1
            }, true);
        }

        if ($scope.filter2 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                'type': $scope.filter2
            }, true);
        }

        if ($scope.filter1 == MAP_CATEGORIES.sensor && $scope.filter3 !== '*') {
            nodeData = $filter('filter')(nodeData, {
                'status': $scope.filter3
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

    $scope.showNode = function (latitude, longitude) {
        $location.url(`/map?show_node=1&latitide=${latitude}&longitude=${longitude}`);
    };

    $scope.showDetail = function (node_category, node_id) {
        var link = '/view',
            category = node_category.toLowerCase();

        link += '/' + category;
        link += '?' + category + '_id=' + node_id;

        $location.url(link);
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.getNodes();
    });

    $scope.$on('$destroy', function () {
        ref.off();
    });
});