var app = angular.module('sensorApp');
var activity = null;

app.controller('MainCtrl', function ($scope) {
    $scope.showLoadingOverlay = function () {
        activity = Metro.activity.open({
            type: 'square',
            style: 'black'
        });
    };

    $scope.hideLoadingOverlay = function () {
        Metro.activity.close(activity);
    };

    $scope.generatePager = function (totalItems, currentPage, pageSize) {
        var totalPages,
            startPage,
            endPage,
            startIndex,
            endIndex,
            pages = [],
            i;

        currentPage = currentPage || 1;

        pageSize = pageSize || 10;

        totalPages = Math.ceil(totalItems / pageSize);

        if (totalPages <= 10) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        startIndex = (currentPage - 1) * pageSize;
        endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        for (i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    };
});