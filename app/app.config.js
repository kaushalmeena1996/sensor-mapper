var app = angular.module('sensorApp');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.constant('SERVICE_EVENTS', {
    nodeDataChanged: "event-node-data-changed"
});

app.constant('PAGE_DETAILS', {
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
    fireStation: {
        name: "Fire Station",
        icon: "assets/img/map/centres/fire-station.png"
    },
    hospital: {
        name: "Hospital",
        icon: "assets/img/map/centres/hospital.png"
    },
    customCentre: {
        name: "Custom Centre",
        icon: "assets/img/map/centres/custom-centre.png"
    }
});
app.constant('CENTRE_TYPES', [
    "Fire Station",
    "Hospital"
]);

app.constant('MAP_LOCATIONS', {
    location: {
        name: "Location",
        icon: "assets/img/map/locations/location.png",
    },
    cinema: {
        name: "Cinema",
        icon: "assets/img/map/locations/cinema.png",
    },
    college: {
        name: "College",
        icon: "assets/img/map/locations/college.png",
    },
    school: {
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
    thermometer: {
        name: "Thermometer",
        icon: {
            normal: "assets/img/map/sensors/thermometer-normal.png",
            failure: "assets/img/map/sensors/thermometer-failure.png",
            abnormal: "assets/img/map/sensors/thermometer-abnormal.png"
        }
    },
    seismometer: {
        name: "Seismometer",
        icon: {
            normal: "assets/img/map/sensors/seismometer-normal.png",
            failure: "assets/img/map/sensors/seismometer-failure.png",
            abnormal: "assets/img/map/sensors/seismometer-abnormal.png"
        }
    },
    pluviometer: {
        name: "Pluviometer",
        icon: {
            normal: "assets/img/map/sensors/pluviometer-normal.png",
            failure: "assets/img/map/sensors/pluviometer-failure.png",
            abnormal: "assets/img/map/sensors/pluviometer-abnormal.png"
        }
    },
    anemometer: {
        name: "Anemometer",
        icon: {
            normal: "assets/img/map/sensors/anemometer-normal.png",
            failure: "assets/img/map/sensors/anemometer-failure.png",
            abnormal: "assets/img/map/sensors/anemometer-abnormal.png"
        }
    }
});

app.constant('SENSOR_TYPES', [
    "Thermometer",
    "Seismometer",
    "Pluviometer",
    "Anemometer"
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