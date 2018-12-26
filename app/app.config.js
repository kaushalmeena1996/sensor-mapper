var app = angular.module('sensorApp');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.constant('PAGES', {
    home: {
        title: "Home",
        data: {
            bgColor: {
                light: "bg-lightGrayBlue",
                normal: "bg-grayBlue",
                dark: "bg-darkGrayBlue"
            }
        }
    },
    map: {
        title: "Map",
        data: {
            bgColor: {
                light: "bg-lightcobalt",
                normal: "bg-cobalt",
                dark: "bg-darkcobalt"
            }
        }
    },
    search: {
        title: "Search",
        data: {
            bgColor: {
                light: "bg-lightEmerald",
                normal: "bg-emerald",
                dark: "bg-darkEmerald"
            }
        }
    },
    route: {
        title: "Route",
        data: {
            bgColor: {
                light: "bg-lightCrimson",
                normal: "bg-crimson",
                dark: "bg-darkCrimson"
            }
        }
    },
    view: {
        title: "View",
        data: {
            bgColor: {
                light: "bg-lightBlue",
                normal: "bg-blue",
                dark: "bg-darkBlue"
            }
        }
    },
    about: {
        title: "About",
        data: {
            bgColor: {
                light: "bg-lightAmber",
                normal: "bg-amber",
                dark: "bg-darkAmber"
            }
        }
    }
});

app.constant('SERVICE_EVENTS', {
    nodeDataChanged: "event-node-data-loaded"
});

app.constant('CHARMS_BAR_CODES', {
    centres: 0,
    locations: 1,
    normalSensors: 2,
    failedSensors: 3,
    abnormalSensors: 4,
    emergencyRoutes: 5,
    customRoutes: 6
});

app.constant('STATUS_CODES', {
    dataLoaded: 0,
    dataUpdated: 1
});

app.constant('ACTION_CODES', {
    showNodeItemOnMap: '0',
    showRouteOnMap: '1'
});

app.constant('MAP_CATEGORIES', {
    centre: "Centre",
    location: "Location",
    sensor: "Sensor"
});

app.constant('CATEGORY_TYPES', [
    "Centre",
    "Location",
    "Sensor"
]);

app.constant('MAP_CENTRES', {
    ct001: {
        name: "Fire Station",
        icon: "assets/img/map/centres/fire-station.png"
    },
    ct002: {
        name: "Hospital",
        icon: "assets/img/map/centres/hospital.png"
    },
    ct00x: {
        name: "Custom Centre",
        icon: "assets/img/map/centres/custom-centre.png"
    }
});

app.constant('CENTRE_TYPES', [
    "Fire Station",
    "Hospital"
]);

app.constant('MAP_LOCATIONS', {
    lt001: {
        name: "Location",
        icon: "assets/img/map/locations/location.png",
    },
    lt002: {
        name: "Cinema",
        icon: "assets/img/map/locations/cinema.png",
    },
    lt003: {
        name: "College",
        icon: "assets/img/map/locations/college.png",
    },
    lt004: {
        name: "School",
        icon: "assets/img/map/locations/school.png",
    },
});

app.constant('LOCATION_TYPES', [
    "Location",
    "Cinema",
    "College",
    "School"
]);

app.constant('MAP_SENSORS', {
    st001: {
        name: "Thermometer",
        icon: {
            normal: "assets/img/map/sensors/thermometer-normal.png",
            failure: "assets/img/map/sensors/thermometer-failure.png",
            abnormal: "assets/img/map/sensors/thermometer-abnormal.png"
        }
    },
    st002: {
        name: "Seismometer",
        icon: {
            normal: "assets/img/map/sensors/seismometer-normal.png",
            failure: "assets/img/map/sensors/seismometer-failure.png",
            abnormal: "assets/img/map/sensors/seismometer-abnormal.png"
        }
    },
    st003: {
        name: "Pluviometer",
        icon: {
            normal: "assets/img/map/sensors/pluviometer-normal.png",
            failure: "assets/img/map/sensors/pluviometer-failure.png",
            abnormal: "assets/img/map/sensors/pluviometer-abnormal.png"
        }
    },
    st004: {
        name: "Anemometer",
        icon: {
            normal: "assets/img/map/sensors/anemometer-normal.png",
            failure: "assets/img/map/sensors/anemometer-failure.png",
            abnormal: "assets/img/map/sensors/anemometer-abnormal.png"
        }
    },
    st005: {
        name: "Mobile",
        icon: {
            normal: "assets/img/map/sensors/mobile-normal.png",
            failure: "assets/img/map/sensors/mobile-failure.png",
            abnormal: "assets/img/map/sensors/mobile-abnormal.png"
        }
    }
});

app.constant('SENSOR_TYPES', [
    "Thermometer",
    "Seismometer",
    "Pluviometer",
    "Anemometer",
    "Mobile"
]);

app.constant('SENSOR_STATUSES', {
    normal: "Normal",
    failure: "Failure",
    abnormal: "Abnormal"
});

app.constant('STATUS_TYPES', [
    "Normal",
    "Failure",
    "Abnormal"
]);

app.constant('MAP_ROUTES', {
    emergency: "Emergency Route",
    custom: "Custom Route"
});