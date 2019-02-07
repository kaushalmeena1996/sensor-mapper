var app = angular.module('sensorApp');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.constant('PAGE_DATA', {
    pd001: {
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
    pd002: {
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
    pd003: {
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
    pd004: {
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
    pd005: {
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
    pd006: {
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
    pd007: {
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
    sd001: {
        title: "Centres",
        mode: 0,
        filter1: "Centre"
    },
    sd002: {
        title: "Location",
        mode: 0,
        filter1: "Location"
    },
    sd003: {
        title: "Normal Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Normal"
    },
    sd004: {
        title: "Failed Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Failure"
    },
    sd005: {
        title: "Abnormal Sensors",
        mode: 0,
        filter1: "Sensor",
        filter2: "Abnormal"
    },
    sd006: {
        title: "Emergency Routes",
        mode: 2
    },
    sd007: {
        title: "Custom Routes",
        mode: 3
    },
    sd008: {
        title: "Information",
        mode: 1
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
    markerInformation: 1,
    emergencyRouteList: 2,
    customRouteList: 3
});

app.constant('STATUS_CODES', {
    dataLoadSuccessful: 0,
    dataLoadFailed: 1,
    dataUpdateSuccessful: 2,
    dataUpdateFailed: 3,
    signInSuccessful: 4,
    signInFailed: 5,
    signOutSuccessful: 6,
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
    ct001: {
        name: "Centre",
        icon: {
            cst001: "assets/img/map/centres/open-centre.png",
            cst002: "assets/img/map/centres/busy-centre.png",
            cst003: "assets/img/map/centres/closed-centre.png",
        }
    },
    ct002: {
        name: "Fire Station",
        icon: {
            cst001: "assets/img/map/centres/open-fire-station.png",
            cst002: "assets/img/map/centres/busy-fire-station.png",
            cst003: "assets/img/map/centres/closed-fire-station.png",
        }
    },
    ct003: {
        name: "Police Station",
        icon: {
            cst001: "assets/img/map/centres/open-police-station.png",
            cst002: "assets/img/map/centres/busy-police-station.png",
            cst003: "assets/img/map/centres/closed-police-station.png",
        }
    },
    ct004: {
        name: "Hospital",
        icon: {
            cst001: "assets/img/map/centres/open-hospital.png",
            cst002: "assets/img/map/centres/busy-hospital.png",
            cst003: "assets/img/map/centres/closed-hospital.png",
        }
    }
});

app.constant('CUSTOM_CENTRE', {
    name: "Custom Centre",
    icon: {
        cst001: "assets/img/map/centres/open-custom-centre.png",
        cst002: "assets/img/map/centres/busy-custom-centre.png",
        cst003: "assets/img/map/centres/closed-custom-centre.png",
    }
});

app.constant('CENTRE_TYPES', [
    "Fire Station",
    "Police Station",
    "Hospital"
]);

app.constant('CENTRE_STATUSES', {
    cst001: {
        name: "Open",
        icon: "assets/img/map/centre-statuses/open.png"
    },
    cst002: {
        name: "Busy",
        icon: "assets/img/map/centre-statuses/busy.png"
    },
    cst003: {
        name: "Closed",
        icon: "assets/img/map/centre-statuses/closed.png"
    }
});

app.constant('CENTRE_STATUS_TYPES', [
    "Open",
    "Busy",
    "Closed"
]);


app.constant('MAP_LOCATIONS', {
    lt001: {
        name: "Location",
        icon: {
            lst001: "assets/img/map/locations/normal-location.png",
            lst002: "assets/img/map/locations/moderate-location.png",
            lst003: "assets/img/map/locations/severe-location.png"
        }
    },
    lt002: {
        name: "City",
        icon: {
            lst001: "assets/img/map/locations/normal-city.png",
            lst002: "assets/img/map/locations/moderate-city.png",
            lst003: "assets/img/map/locations/severe-city.png"
        }
    },
    lt003: {
        name: "Zone",
        icon: {
            lst001: "assets/img/map/locations/normal-zone.png",
            lst002: "assets/img/map/locations/moderate-zone.png",
            lst003: "assets/img/map/locations/severe-zone.png"
        }
    },
    lt004: {
        name: "Cluster",
        icon: {
            lst001: "assets/img/map/locations/normal-cluster.png",
            lst002: "assets/img/map/locations/moderate-cluster.png",
            lst003: "assets/img/map/locations/severe-cluster.png"
        }
    },
    lt005: {
        name: "College",
        icon: {
            lst001: "assets/img/map/locations/normal-college.png",
            lst002: "assets/img/map/locations/moderate-college.png",
            lst003: "assets/img/map/locations/severe-college.png"
        }
    },
    lt006: {
        name: "School",
        icon: {
            lst001: "assets/img/map/locations/normal-school.png",
            lst002: "assets/img/map/locations/moderate-school.png",
            lst003: "assets/img/map/locations/severe-school.png"
        }
    },
    lt007: {
        name: "Theater",
        icon: {
            lst001: "assets/img/map/locations/normal-theatre.png",
            lst002: "assets/img/map/locations/moderate-theatre.png",
            lst003: "assets/img/map/locations/severe-theatre.png"
        }
    },
    lt007: {
        name: "Bank",
        icon: {
            lst001: "assets/img/map/locations/normal-bank.png",
            lst002: "assets/img/map/locations/moderate-bank.png",
            lst003: "assets/img/map/locations/severe-cinema.png"
        }
    },
    lt008: {
        name: "Hotel",
        icon: {
            lst001: "assets/img/map/locations/normal-hotel.png",
            lst002: "assets/img/map/locations/moderate-hotel.png",
            lst003: "assets/img/map/locations/severe-Hotel.png"
        }
    },
    lt009: {
        name: "Restaurant",
        icon: {
            lst001: "assets/img/map/locations/normal-restaurant.png",
            lst002: "assets/img/map/locations/moderate-restaurant.png",
            lst003: "assets/img/map/locations/severe-restaurant.png"
        }
    },
    lt010: {
        name: "Store",
        icon: {
            lst001: "assets/img/map/locations/normal-store.png",
            lst002: "assets/img/map/locations/moderate-store.png",
            lst003: "assets/img/map/locations/severe-store.png"
        }
    }
});

app.constant('LOCATION_TYPES', [
    "City",
    "Zone",
    "Cluster",
    "College",
    "School",
    "Theatre",
    "Bank",
    "Hotel",
    "Restaurant",
    "Store"
]);

app.constant('DISASTER_TYPES', {
    dt001: {
        name: "Fire",
        haveLevels: true,
        icon: {
            lst002: "assets/img/map/location-statuses/moderate-fire.png",
            lst003: "assets/img/map/location-statuses/severe-fire.png",
        }
    },
    dt002: {
        name: "Flood",
        haveLevels: true,
        icon: {
            lst002: "assets/img/map/location-statuses/moderate-flood.png",
            lst003: "assets/img/map/location-statuses/severe-flood.png",
        }
    },
    dt003: {
        name: "Cyclone",
        haveLevels: true,
        icon: {
            lst002: "assets/img/map/location-statuses/moderate-cyclone.png",
            lst003: "assets/img/map/location-statuses/severe-cyclone.png",
        }
    },
    dt004: {
        name: "Earthquake",
        haveLevels: true,
        icon: {
            lst002: "assets/img/map/location-statuses/moderate-earthquake.png",
            lst003: "assets/img/map/location-statuses/severe-earthquake.png",
        }
    },
    dt005: {
        name: "Burglary",
        haveLevels: false,
        icon: "assets/img/map/location-statuses/burglary.png"
    },
    dt006: {
        name: "Robbery",
        haveLevels: false,
        icon: "assets/img/map/location-statuses/robbery.png"
    }
});

app.constant('LOCATION_STATUSES', {
    lst001: {
        name: "Normal",
        icon: "assets/img/map/location-statuses/normal.png"
    },
    lst002: {
        name: "Moderate"
    },
    lst003: {
        name: "Severe"
    }
});

app.constant('LOCATION_STATUS_TYPES', [
    "Normal",
    "Moderate",
    "Severe"
]);

app.constant('MAP_SENSORS', {
    st001: {
        name: "Sensor",
        icon: {
            sst001: "assets/img/map/sensors/normal-sensor.png",
            sst002: "assets/img/map/sensors/moderate-sensor.png",
            sst003: "assets/img/map/sensors/severe-sensor.png"
        }
    },
    st002: {
        name: "Thermometer",
        icon: {
            sst001: "assets/img/map/sensors/normal-thermometer.png",
            sst002: "assets/img/map/sensors/moderate-thermometer.png",
            sst003: "assets/img/map/sensors/severe-thermometer.png"
        }
    },
    st003: {
        name: "Hygrometer",
        icon: {
            sst001: "assets/img/map/sensors/normal-hygrometer.png",
            sst002: "assets/img/map/sensors/moderate-hygrometer.png",
            sst003: "assets/img/map/sensors/severe-hygrometer.png"
        }
    },
    st004: {
        name: "Udometer",
        icon: {
            sst001: "assets/img/map/sensors/normal-udometer.png",
            sst002: "assets/img/map/sensors/moderate-udometer.png",
            sst003: "assets/img/map/sensors/severe-udometer.png"
        }
    },
    st005: {
        name: "Anemometer",
        icon: {
            sst001: "assets/img/map/sensors/normal-anemometer.png",
            sst002: "assets/img/map/sensors/moderate-anemometer.png",
            sst003: "assets/img/map/sensors/severe-anemometer.png"
        }
    },
    st006: {
        name: "Gas-Meter",
        icon: {
            sst001: "assets/img/map/sensors/normal-gas-meter.png",
            sst002: "assets/img/map/sensors/moderate-gas-meter.png",
            sst003: "assets/img/map/sensors/severe-gas-meter.png"
        }
    },
    st007: {
        name: "Motion-Detector",
        icon: {
            sst001: "assets/img/map/sensors/normal-motion-detector.png",
            sst004: "assets/img/map/sensors/triggered-motion-detector.png"
        }
    },
    st008: {
        name: "Alarm",
        icon: {
            sst001: "assets/img/map/sensors/normal-alarm.png",
            sst004: "assets/img/map/sensors/triggered-alarm.png"
        }
    }
});

app.constant('SENSOR_TYPES', [
    "Thermometer",
    "Hygrometer",
    "Udometer",
    "Anemometer",
    "Gas-Meter",
    "Motion-Detector",
    "Alarm"
]);

app.constant('SENSOR_STATUSES', {
    sst001: {
        name: "Normal",
        icon: "assets/img/map/sensor-statuses/normal.png"
    },
    sst002: {
        name: "Moderate",
        icon: "assets/img/map/sensor-statuses/moderate.png"
    },
    sst003: {
        name: "Severe",
        icon: "assets/img/map/sensor-statuses/severe.png"
    },
    sst004: {
        name: "Triggered",
        icon: "assets/img/map/sensor-statuses/triggered.png"
    }
});

app.constant('SENSOR_STATUS_TYPES', [
    "Normal",
    "Moderate",
    "Severe",
    "Triggered"
]);

app.constant('MAP_ROUTES', {
    emergency: "Emergency Route",
    hospital: "Hospital Route",
    custom: "Custom Route"
});

app.constant('DEFAULT_PHOTO_PATH', 'assets/img/default_image.png');