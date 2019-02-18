var app = angular.module('sensorApp');

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('theme-home')
        .primaryPalette('blue-grey')
        .accentPalette('pink');

    $mdThemingProvider.theme('theme-map')
        .primaryPalette('deep-purple')
        .accentPalette('blue')

    $mdThemingProvider.theme('theme-search')
        .primaryPalette('purple')
        .accentPalette('red')

    $mdThemingProvider.theme('theme-route')
        .primaryPalette('indigo')
        .accentPalette('pink')

    $mdThemingProvider.theme('theme-view')
        .primaryPalette('blue')
        .accentPalette('red')

    $mdThemingProvider.theme('theme-about')
        .primaryPalette('green')
        .accentPalette('amber')

    $mdThemingProvider.theme('theme-login')
        .primaryPalette('teal')
        .accentPalette('red')

    $mdThemingProvider.alwaysWatchTheme(true);
})

app.constant('PAGE_DATA', {
    pd001: {
        id: "pd001",
        title: "Home",
        description: "Display home page of application.",
        headerHidden: false,
        controller: null,
        icon: "home",
        route: "/",
        href: "#!/",
        templateUrl: "views/home.html",
        theme: "theme-home"
    },
    pd002: {
        id: "pd002",
        title: "Map",
        description: "Display centres, locations and sensors on map.",
        headerHidden: true,
        controller: "MapController",
        icon: "map",
        route: "/map",
        href: "#!/map",
        templateUrl: "views/map.html",
        theme: "theme-map"
    },
    pd003: {
        id: "pd003",
        title: "Search",
        description: "Search centres, location or sensor by text or by applying filters.",
        headerHidden: false,
        controller: "SearchController",
        icon: "search",
        route: "/search",
        href: "#!/search",
        templateUrl: "views/search.html",
        theme: "theme-search"
    },
    pd004: {
        id: "pd004",
        title: "Route-Centre",
        description: "Generate route between selected centres and sensors.",
        headerHidden: false,
        controller: "RouteCentreController",
        icon: "timeline",
        route: "/route/centre",
        href: "#!/route/centre",
        templateUrl: "views/route001.html",
        theme: "theme-route"
    },
    pd005: {
        id: "pd005",
        title: "Route-Sensor",
        description: "Generate route between selected centres and sensors.",
        headerHidden: false,
        controller: "RouteSensorController",
        icon: "timeline",
        route: "/route/sensor",
        href: "#!/route/sensor",
        templateUrl: "views/route002.html",
        theme: "theme-route"
    },
    pd006: {
        id: "pd006",
        title: "Route-Result",
        description: "Generate route between selected centres and sensors.",
        headerHidden: false,
        controller: "RouteResultController",
        icon: "timeline",
        route: "/route/result",
        href: "#!/route/result",
        templateUrl: "views/route003.html",
        theme: "theme-route"
    },
    pd007: {
        id: "pd007",
        title: "View-Centre",
        description: "Show details of particular node.",
        headerHidden: false,
        controller: "ViewCentreController",
        icon: "folder",
        route: "/view/centre",
        href: "#!/view/centre",
        templateUrl: "views/view001.html",
        theme: "theme-view"
    },
    pd008: {
        id: "pd008",
        title: "View-Location",
        description: "Show details of particular node.",
        headerHidden: false,
        controller: "ViewLocationController",
        icon: "folder",
        route: "/view/location",
        href: "#!/view/location",
        templateUrl: "views/view002.html",
        theme: "theme-view"
    },
    pd009: {
        id: "pd009",
        title: "View-Sensor",
        description: "Show details of particular node.",
        headerHidden: false,
        controller: "ViewSensorController",
        icon: "folder",
        route: "/view/sensor",
        href: "#!/view/sensor",
        templateUrl: "views/view003.html",
        theme: "theme-view"
    },
    pd010: {
        id: "pd010",
        title: "About",
        description: "Display information about application.",
        headerHidden: false,
        controller: null,
        icon: "info_outline",
        route: "/about",
        href: "#!/about",
        templateUrl: "views/about.html",
        theme: "theme-about"
    },
    pd011: {
        id: "pd011",
        title: "Login",
        description: "Display form for logging in.",
        headerHidden: true,
        controller: "LoginController",
        icon: "input",
        route: "/login",
        href: "#!/login",
        templateUrl: "views/login.html",
        theme: "theme-login"
    },
    pd012: {
        id: "pd012",
        title: "Logout",
        description: "Logs out from application.",
        headerHidden: true,
        controller: "LogoutController",
        icon: "power_settings_new",
        route: "/logout",
        href: "#!/logout",
        templateUrl: "views/logout.html",
        theme: "theme-login"
    }
});

app.constant('SIDEBAR_DATA', {
    sd001: {
        id: "sd001",
        title: "Normal Centres",
        description: "Display list of relief centres.",
        icon: "notifications",
        mode: 0,
        filter1: "c001"
    },
    sd002: {
        id: "sd002",
        title: "Normal Locations",
        description: "Display list of locations.",
        icon: "place",
        mode: 0,
        filter1: "c002"
    },
    sd003: {
        id: "sd003",
        title: "Normal Sensors",
        description: "Display list of sensors behaving normally.",
        icon: "wifi",
        mode: 0,
        filter1: "c003",
        filter2: "sst001"
    },
    sd004: {
        id: "sd004",
        title: "Custom Routes",
        description: "Display list of user defined generated routes.",
        icon: "timeline",
        mode: 3
    },
    sd005: {
        id: "sd005",
        title: "Information",
        description: "Display node information.",
        icon: "info",
        mode: 1
    },
    sd006: {
        id: "sd006",
        title: "Busy Centres",
        description: "Display list of busy centres.",
        icon: "notifications",
        mode: 0,
        filter1: "c001",
        filter2: "cst002"
    },
    sd007: {
        id: "sd007",
        title: "Closed Centres",
        description: "Display list of closed centres.",
        icon: "notifications",
        mode: 0,
        filter1: "c001",
        filter2: "cst003"
    },
    sd008: {
        id: "sd008",
        title: "Severe Locations",
        description: "Display list of severe locations.",
        icon: "place",
        mode: 0,
        filter1: "c002",
        filter2: "lst002"
    },
    sd009: {
        id: "sd009",
        title: "Extreme Locations",
        description: "Display list of extreme locations.",
        icon: "place",
        mode: 0,
        filter1: "c002",
        filter2: "lst003"
    },
    sd010: {
        id: "sd010",
        title: "Severe Sensors",
        description: "Display list sensors have severe readings.",
        icon: "wifi",
        mode: 0,
        filter1: "c003",
        filter2: "sst002"
    },
    sd011: {
        id: "sd011",
        title: "Extreme Sensors",
        description: "Display list sensors have extreme readings.",
        icon: "wifi",
        mode: 0,
        filter1: "c003",
        filter2: "sst003"
    },
    sd012: {
        id: "sd012",
        title: "Emergency Routes",
        description: "Display list of routes from relief centres to abnormal sensors.",
        icon: "timeline",
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


app.constant('SIDEBAR_MODES', {
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
    c001: {
        id: "c001",
        name: "Centre"
    },
    c002: {
        id: "c002",
        name: "Location"
    },
    c003: {
        id: "c003",
        name: "Location"
    }
});

app.constant('CATEGORY_TYPES', [
    {
        name: "Centre",
        value: "c001"
    },
    {
        name: "Location",
        value: "c002"
    },
    {
        name: "Sensor",
        value: "c003"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('MAP_CENTRES', {
    ct001: {
        id: "ct001",
        name: "Centre",
        icons: {
            cst001: "assets/img/map/centres/open-centre.png",
            cst002: "assets/img/map/centres/busy-centre.png",
            cst003: "assets/img/map/centres/closed-centre.png",
        }
    },
    ct002: {
        id: "ct002",
        name: "Fire Station",
        icons: {
            cst001: "assets/img/map/centres/open-fire-station.png",
            cst002: "assets/img/map/centres/busy-fire-station.png",
            cst003: "assets/img/map/centres/closed-fire-station.png",
        }
    },
    ct003: {
        id: "ct003",
        name: "Police Station",
        icons: {
            cst001: "assets/img/map/centres/open-police-station.png",
            cst002: "assets/img/map/centres/busy-police-station.png",
            cst003: "assets/img/map/centres/closed-police-station.png",
        }
    },
    ct004: {
        id: "ct004",
        name: "Hospital",
        icons: {
            cst001: "assets/img/map/centres/open-hospital.png",
            cst002: "assets/img/map/centres/busy-hospital.png",
            cst003: "assets/img/map/centres/closed-hospital.png",
        }
    }
});

app.constant('CUSTOM_CENTRE', {
    id: "ctxxx",
    name: "Custom Centre",
    icons: {
        cst001: "assets/img/map/centres/open-custom-centre.png",
        cst002: "assets/img/map/centres/busy-custom-centre.png",
        cst003: "assets/img/map/centres/closed-custom-centre.png",
    }
});

app.constant('CENTRE_TYPES', [
    {
        name: "Fire Station",
        value: "ct002"
    },
    {
        name: "Police Station",
        value: "ct003"
    },
    {
        name: "Hospital",
        value: "ct004"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('CENTRE_STATUSES', {
    cst001: {
        id: "cst001",
        name: "Open",
        icon: "assets/img/map/centre-statuses/open.png"
    },
    cst002: {
        id: "cst002",
        name: "Busy",
        icon: "assets/img/map/centre-statuses/busy.png"
    },
    cst003: {
        id: "cst003",
        name: "Closed",
        icon: "assets/img/map/centre-statuses/closed.png"
    }
});

app.constant('CENTRE_STATUS_TYPES', [
    {
        name: "Open",
        value: "cst001"
    },
    {
        name: "Busy",
        value: "cst002"
    },
    {
        name: "Closed",
        value: "cst003"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('MAP_LOCATIONS', {
    lt001: {
        id: "lt001",
        name: "Location",
        icons: {
            lst001: "assets/img/map/locations/normal-location.png",
            lst002: "assets/img/map/locations/severe-location.png",
            lst003: "assets/img/map/locations/extreme-location.png"
        }
    },
    lt002: {
        id: "lt002",
        name: "City",
        icons: {
            lst001: "assets/img/map/locations/normal-city.png",
            lst002: "assets/img/map/locations/severe-city.png",
            lst003: "assets/img/map/locations/extreme-city.png"
        }
    },
    lt003: {
        id: "lt003",
        name: "Zone",
        icons: {
            lst001: "assets/img/map/locations/normal-zone.png",
            lst002: "assets/img/map/locations/severe-zone.png",
            lst003: "assets/img/map/locations/extreme-zone.png"
        }
    },
    lt004: {
        id: "lt004",
        name: "Cluster",
        icons: {
            lst001: "assets/img/map/locations/normal-cluster.png",
            lst002: "assets/img/map/locations/severe-cluster.png",
            lst003: "assets/img/map/locations/extreme-cluster.png"
        }
    },
    lt005: {
        id: "lt005",
        name: "College",
        icons: {
            lst001: "assets/img/map/locations/normal-college.png",
            lst002: "assets/img/map/locations/severe-college.png",
            lst003: "assets/img/map/locations/extreme-college.png"
        }
    },
    lt006: {
        id: "lt006",
        name: "Factory",
        icons: {
            lst001: "assets/img/map/locations/normal-factory.png",
            lst002: "assets/img/map/locations/severe-factory.png",
            lst003: "assets/img/map/locations/extreme-factory.png"
        }
    },
    lt007: {
        id: "lt007",
        name: "Bank",
        icons: {
            lst001: "assets/img/map/locations/normal-bank.png",
            lst002: "assets/img/map/locations/severe-bank.png",
            lst003: "assets/img/map/locations/extreme-bank.png"
        }
    },
    lt008: {
        id: "lt008",
        name: "Hotel",
        icons: {
            lst001: "assets/img/map/locations/normal-hotel.png",
            lst002: "assets/img/map/locations/severe-hotel.png",
            lst003: "assets/img/map/locations/extreme-hotel.png"
        }
    },
    lt009: {
        id: "lt009",
        name: "Restaurant",
        icons: {
            lst001: "assets/img/map/locations/normal-restaurant.png",
            lst002: "assets/img/map/locations/severe-restaurant.png",
            lst003: "assets/img/map/locations/extreme-restaurant.png"
        }
    },
    lt010: {
        id: "lt010",
        name: "Store",
        icons: {
            lst001: "assets/img/map/locations/normal-store.png",
            lst002: "assets/img/map/locations/severe-store.png",
            lst003: "assets/img/map/locations/extreme-store.png"
        }
    }
});

app.constant('LOCATION_TYPES', [
    {
        name: "City",
        value: "lt002"
    },
    {
        name: "Zone",
        value: "lt003"
    },
    {
        name: "Cluster",
        value: "lt004"
    },
    {
        name: "College",
        value: "lt005"
    },
    {
        name: "Factory",
        value: "lt006"
    },
    {
        name: "Bank",
        value: "lt007"
    },
    {
        name: "Hotel",
        value: "lt008"
    },
    {
        name: "Restaurant",
        value: "lt009"
    },
    {
        name: "Store",
        value: "lt010"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('DISASTER_TYPES', {
    dt001: {
        id: "dt001",
        name: "Fire",
        requiredCentres: ["ct002", "ct004"],
        haveLevels: true,
        icons: {
            lst002: "assets/img/map/location-statuses/severe-fire.png",
            lst003: "assets/img/map/location-statuses/extreme-fire.png",
        }
    },
    dt002: {
        id: "dt002",
        name: "Flood",
        requiredCentres: ["ct001", "ct004"],
        haveLevels: true,
        icons: {
            lst002: "assets/img/map/location-statuses/severe-flood.png",
            lst003: "assets/img/map/location-statuses/extreme-flood.png",
        }
    },
    dt003: {
        id: "dt003",
        name: "Cyclone",
        requiredCentres: ["ct001", "ct004"],
        haveLevels: true,
        icons: {
            lst002: "assets/img/map/location-statuses/severe-cyclone.png",
            lst003: "assets/img/map/location-statuses/extreme-cyclone.png",
        }
    },
    dt004: {
        id: "dt004",
        name: "Earthquake",
        requiredCentres: ["ct001", "ct004"],
        haveLevels: true,
        icons: {
            lst002: "assets/img/map/location-statuses/severe-earthquake.png",
            lst003: "assets/img/map/location-statuses/extreme-earthquake.png",
        }
    },
    dt005: {
        id: "dt005",
        name: "Burglary",
        requiredCentres: ["ct003"],
        haveLevels: false,
        icon: "assets/img/map/location-statuses/burglary.png"
    },
    dt006: {
        id: "dt006",
        name: "Robbery",
        requiredCentres: ["ct003"],
        haveLevels: false,
        icon: "assets/img/map/location-statuses/robbery.png"
    }
});

app.constant('LOCATION_STATUSES', {
    lst001: {
        id: "lst001",
        name: "Normal",
        icon: "assets/img/map/location-statuses/normal.png"
    },
    lst002: {
        id: "lst002",
        name: "Extreme"
    },
    lst003: {
        id: "lst003",
        name: "Extreme"
    }
});

app.constant('LOCATION_STATUS_TYPES', [
    {
        name: "Normal",
        value: "lst001"
    },
    {
        name: "Extreme",
        value: "lst002"
    },
    {
        name: "Extreme",
        value: "lst003"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('MAP_SENSORS', {
    st001: {
        id: "st001",
        name: "Sensor",
        icons: {
            sst001: "assets/img/map/sensors/normal-sensor.png",
            sst002: "assets/img/map/sensors/severe-sensor.png",
            sst003: "assets/img/map/sensors/extreme-sensor.png"
        }
    },
    st002: {
        id: "st002",
        name: "Thermometer",
        icons: {
            sst001: "assets/img/map/sensors/normal-thermometer.png",
            sst002: "assets/img/map/sensors/severe-thermometer.png",
            sst003: "assets/img/map/sensors/extreme-thermometer.png"
        }
    },
    st003: {
        id: "st003",
        name: "Hygrometer",
        icons: {
            sst001: "assets/img/map/sensors/normal-hygrometer.png",
            sst002: "assets/img/map/sensors/severe-hygrometer.png",
            sst003: "assets/img/map/sensors/extreme-hygrometer.png"
        }
    },
    st004: {
        id: "st004",
        name: "Udometer",
        icons: {
            sst001: "assets/img/map/sensors/normal-udometer.png",
            sst002: "assets/img/map/sensors/severe-udometer.png",
            sst003: "assets/img/map/sensors/extreme-udometer.png"
        }
    },
    st005: {
        id: "st005",
        name: "Anemometer",
        icons: {
            sst001: "assets/img/map/sensors/normal-anemometer.png",
            sst002: "assets/img/map/sensors/severe-anemometer.png",
            sst003: "assets/img/map/sensors/extreme-anemometer.png"
        }
    },
    st006: {
        id: "st006",
        name: "Gas-Meter",
        icons: {
            sst001: "assets/img/map/sensors/normal-gas-meter.png",
            sst002: "assets/img/map/sensors/severe-gas-meter.png",
            sst003: "assets/img/map/sensors/extreme-gas-meter.png"
        }
    },
    st007: {
        id: "st007",
        name: "Motion-Detector",
        icons: {
            sst001: "assets/img/map/sensors/normal-motion-detector.png",
            sst004: "assets/img/map/sensors/triggered-motion-detector.png"
        }
    },
    st008: {
        id: "st008",
        name: "Alarm",
        icons: {
            sst001: "assets/img/map/sensors/normal-alarm.png",
            sst004: "assets/img/map/sensors/triggered-alarm.png"
        }
    }
});

app.constant('SENSOR_TYPES', [
    {
        name: "Thermometer",
        value: "st002"
    },
    {
        name: "Hygrometer",
        value: "st003"
    },
    {
        name: "Udometer",
        value: "st004"
    },
    {
        name: "Anemometer",
        value: "st005"
    },
    {
        name: "Gas-Sensor",
        value: "st006"
    },
    {
        name: "Motion-Detector",
        value: "st007"
    },
    {
        name: "Alarm",
        value: "st008"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('SENSOR_STATUSES', {
    sst001: {
        id: "sst001",
        name: "Normal",
        icon: "assets/img/map/sensor-statuses/normal.png"
    },
    sst002: {
        id: "sst002",
        name: "Severe",
        icon: "assets/img/map/sensor-statuses/severe.png"
    },
    sst003: {
        id: "sst003",
        name: "Extreme",
        icon: "assets/img/map/sensor-statuses/extreme.png"
    },
    sst004: {
        id: "sst004",
        name: "Triggered",
        icon: "assets/img/map/sensor-statuses/triggered.png"
    }
});

app.constant('SENSOR_STATUS_TYPES', [
    {
        name: "Normal",
        value: "sst001"
    },
    {
        name: "Severe",
        value: "sst002"
    },
    {
        name: "Extreme",
        value: "sst003"
    },
    {
        name: "Triggered",
        value: "sst004"
    },
    {
        name: "All",
        value: "*"
    }
]);

app.constant('MAP_ROUTES', {
    r001: {
        id: "r001",
        name: "Emergency Route"
    },
    r002: {
        id: "r002",
        name: "Hospital Route"
    },
    r003: {
        id: "r003",
        name: "Emergency Route"
    }
});

app.constant('IMAGE_DATA', {
    id001: {
        id: "id001",
        name: "Map-Image",
        multiple: false,
        path: "assets/img/map/others/map.png",
    },
    id002: {
        id: "id002",
        name: "Search-Image",
        multiple: false,
        path: "assets/img/map/others/search.png",
    },
    id003: {
        id: "id003",
        name: "Route-Image",
        multiple: true,
        paths: {
            p001: "assets/img/map/others/route-normal.png",
            p002: "assets/img/map/others/route-emergency.png"
        }
    },
    id004: {
        id: "id004",
        name: "Info-Image",
        multiple: false,
        path: "assets/img/map/others/info.png",
    },
    id005: {
        id: "id005",
        name: "Login-Image",
        multiple: false,
        path: "assets/img/map/others/login.png",
    },
    id006: {
        id: "id006",
        name: "Logout-Image",
        multiple: false,
        path: "assets/img/map/others/logout.png",
    }
});

app.constant('DEFAULT_PHOTO_PATH', "assets/img/default-photo.png");
