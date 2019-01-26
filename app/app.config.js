var app = angular.module('sensorApp');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.constant('PAGE_DATA', {
    home: {
        title: "Home",
        masterPage: true,
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
        masterPage: true,
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
        masterPage: true,
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
        masterPage: true,
        data: {
            bgColor: {
                light: "bg-lightBrown",
                normal: "bg-brown",
                dark: "bg-darkBrown"
            }
        }
    },
    view: {
        title: "View",
        masterPage: true,
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
        masterPage: true,
        data: {
            bgColor: {
                light: "bg-lightAmber",
                normal: "bg-amber",
                dark: "bg-darkAmber"
            }
        }
    },
    login: {
        title: "Login",
        masterPage: false,
        data: {
            bgColor: {
                light: "bg-lightMagenta",
                normal: "bg-magenta",
                dark: "bg-darkMagenta"
            }
        }
    }
});

app.constant('CHARMS_BAR_DATA', {
    sd000: {
        title: "Centres",
        mode: 0,
        filter1: "Centre"
    },
    sd001: {
        title: "Location",
        mode: 0,
        filter1: "Location"
    },
    sd002: {
        title: "Normal Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Normal"
    },
    sd003: {
        title: "Failed Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Failure"
    },
    sd004: {
        title: "Abnormal Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Abnormal"
    },
    sd005: {
        title: "Emergency Routes",
        mode: 3
    },
    sd006: {
        title: "Custom Routes",
        mode: 4
    },
    sd007: {
        title: "Information",
        mode: 2
    }
});

app.constant('SERVICE_EVENTS', {
    nodeData: "event-node-data",
    chartData: "event-chart-data"
});

app.constant('AUTH_EVENTS', {
    signIn: "event-sign-in",
    signOut: "event-sign-out",
});


app.constant('CHARMS_BAR_MODES', {
    markerList: 0,
    markerInformation: 2,
    emergencyRouteList: 3,
    customRouteList: 4
});

app.constant('STATUS_CODES', {
    dataLoadSuccess: 0,
    dataLoadFailed: 1,
    dataUpdateSuccess: 2,
    dataUpdateFailed: 3,
    signInSuccess: 4,
    signInFailed: 5,
    signOutSuccess: 6,
    signOutFailed: 7
});

app.constant('PLOT_CODES', {
    nodeItem: 0,
    route: 1
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
    ct000: {
        name: "Centre",
        icon: "assets/img/map/centres/centre.png"
    },
    ct001: {
        name: "Fire Station",
        icon: "assets/img/map/centres/fire-station.png"
    },
    ct002: {
        name: "Police Station",
        icon: "assets/img/map/centres/police-station.png"
    },
    ct003: {
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
    lt000: {
        name: "Location",
        icon: "assets/img/map/locations/location.png",
    },
    lt001: {
        name: "City",
        icon: "assets/img/map/locations/city.png",
    },
    lt002: {
        name: "Zone",
        icon: "assets/img/map/locations/zone.png",
    },
    lt003: {
        name: "Cluster",
        icon: "assets/img/map/locations/cluster.png",
    },
    lt004: {
        name: "College",
        icon: "assets/img/map/locations/college.png",
    },
    lt005: {
        name: "School",
        icon: "assets/img/map/locations/school.png",
    },
    lt006: {
        name: "Cinema",
        icon: "assets/img/map/locations/cinema.png",
    },
});

app.constant('LOCATION_TYPES', [
    "Location",
    "Cinema",
    "College",
    "School"
]);

app.constant('MAP_SENSORS', {
    st000: {
        name: "Sensor",
        icon: {
            normal: "assets/img/map/sensors/sensor-normal.png",
            failure: "assets/img/map/sensors/sensor-failure.png",
            abnormal: "assets/img/map/sensors/sensor-abnormal.png"
        }
    },
    st001: {
        name: "Thermometer",
        icon: {
            normal: "assets/img/map/sensors/thermometer-normal.png",
            failure: "assets/img/map/sensors/thermometer-failure.png",
            abnormal: "assets/img/map/sensors/thermometer-abnormal.png"
        }
    },
    st002: {
        name: "Hygrometer",
        icon: {
            normal: "assets/img/map/sensors/hygrometer-normal.png",
            failure: "assets/img/map/sensors/hygrometer-failure.png",
            abnormal: "assets/img/map/sensors/hygrometer-abnormal.png"
        }
    },
    st003: {
        name: "Udometer",
        icon: {
            normal: "assets/img/map/sensors/udometer-normal.png",
            failure: "assets/img/map/sensors/udometer-failure.png",
            abnormal: "assets/img/map/sensors/udometer-abnormal.png"
        }
    },
    st004: {
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