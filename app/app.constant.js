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
        icon: "location_city",
        mode: 0,
        color: "#000000",
        filter1: "c001",
        filter2: "cst001"
    },
    sd002: {
        id: "sd002",
        title: "Normal Locations",
        description: "Display list of locations.",
        icon: "place",
        mode: 0,
        color: "#000000",
        filter1: "c002",
        filter2: "lst001"
    },
    sd003: {
        id: "sd003",
        title: "Normal Sensors",
        description: "Display list of sensors which have normal readings.",
        icon: "settings_remote",
        mode: 0,
        color: "#000000",
        filter1: "c003",
        filter2: "sst001"
    },
    sd004: {
        id: "sd004",
        title: "Custom Routes",
        description: "Display list of user defined generated routes.",
        icon: "timeline",
        mode: 5,
        color: "#000000",
    },
    sd005: {
        id: "sd005",
        title: "Tracked Sensors",
        description: "Display list of tracked sensors.",
        icon: "gps_fixed",
        mode: 2,
        color: "#000000",
    },
    sd006: {
        id: "sd006",
        title: "Information",
        description: "Display node information.",
        icon: "info",
        mode: 1,
        color: "#000000",
    },
    sd007: {
        id: "sd007",
        title: "Busy Centres",
        description: "Display list of busy centres.",
        icon: "location_city",
        mode: 0,
        color: "#fa6800",
        filter1: "c001",
        filter2: "cst002"
    },
    sd008: {
        id: "sd008",
        title: "Closed Centres",
        description: "Display list of closed centres.",
        icon: "location_city",
        mode: 0,
        color: "#ce352c",
        filter1: "c001",
        filter2: "cst003"
    },
    sd009: {
        id: "sd009",
        title: "Serious Locations",
        description: "Display list of serious locations.",
        icon: "place",
        mode: 0,
        color: "#fa6800",
        filter1: "c002",
        filter2: "lst002"
    },
    sd010: {
        id: "sd010",
        title: "Extreme Locations",
        description: "Display list of extreme locations.",
        icon: "place",
        mode: 0,
        color: "#ce352c",
        filter1: "c002",
        filter2: "lst003"
    },
    sd011: {
        id: "sd011",
        title: "Failed Sensors",
        description: "Display list sensors which have failed.",
        icon: "settings_remote",
        mode: 0,
        color: "#fa6800",
        filter1: "c003",
        filter2: "sst002"
    },
    sd012: {
        id: "sd012",
        title: "Abnormal Sensors",
        description: "Display list sensors which have abnormal readings.",
        icon: "settings_remote",
        mode: 0,
        color: "#ce352c",
        filter1: "c003",
        filter2: "sst003"
    },
    sd013: {
        id: "sd013",
        title: "Hospital Routes",
        description: "Display list of routes from hospital to disaster affected locations.",
        icon: "timeline",
        mode: 3,
        color: "#fa6800",
    },
    sd014: {
        id: "sd014",
        title: "Emergency Routes",
        description: "Display list of routes from relief centres to disaster affected locations.",
        icon: "timeline",
        mode: 4,
        color: "#ce352c",
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
    trackedSensorList: 2,
    hospitalRouteList: 3,
    emergencyRouteList: 4,
    customRouteList: 5
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
        name: "Sensor"
    },
    cxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('MAP_CENTRES', {
    ct001: {
        id: "ct001",
        name: "Centre",
        icons: {
            cst001: "assets/img/marker/centre/centre-001.png",
            cst002: "assets/img/marker/centre/centre-002.png",
            cst003: "assets/img/marker/centre/centre-003.png",
        }
    },
    ct002: {
        id: "ct002",
        name: "Fire Station",
        icons: {
            cst001: "assets/img/marker/centre/fire-station-001.png",
            cst002: "assets/img/marker/centre/fire-station-002.png",
            cst003: "assets/img/marker/centre/fire-station-003.png",
        }
    },
    ct003: {
        id: "ct003",
        name: "Police Station",
        icons: {
            cst001: "assets/img/marker/centre/police-station-001.png",
            cst002: "assets/img/marker/centre/police-station-002.png",
            cst003: "assets/img/marker/centre/police-station-003.png",
        }
    },
    ct004: {
        id: "ct004",
        name: "Hospital",
        icons: {
            cst001: "assets/img/marker/centre/hospital-001.png",
            cst002: "assets/img/marker/centre/hospital-002.png",
            cst003: "assets/img/marker/centre/hospital-003.png",
        }
    },
    ct005: {
        id: "ct005",
        name: "Custom Centre",
        icons: {
            cst001: "assets/img/marker/centre/custom-centre-001.png",
            cst002: "assets/img/marker/centre/custom-centre-002.png",
            cst003: "assets/img/marker/centre/custom-centre-003.png",
        }
    },
    ctxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('CENTRE_STATUSES', {
    cst001: {
        id: "cst001",
        name: "Open",
        icon: "assets/img/status/centre/open.png"
    },
    cst002: {
        id: "cst002",
        name: "Busy",
        icon: "assets/img/status/centre/busy.png"
    },
    cst003: {
        id: "cst003",
        name: "Closed",
        icon: "assets/img/status/centre/closed.png"
    },
    cstxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('MAP_LOCATIONS', {
    lt001: {
        id: "lt001",
        name: "Location",
        icons: {
            lst001: "assets/img/marker/location/location-001.png",
            lst002: "assets/img/marker/location/location-002.png",
            lst003: "assets/img/marker/location/location-002.png"
        }
    },
    lt002: {
        id: "lt002",
        name: "City",
        icons: {
            lst001: "assets/img/marker/location/city-001.png",
            lst002: "assets/img/marker/location/city-002.png",
            lst003: "assets/img/marker/location/city-003.png"
        }
    },
    lt003: {
        id: "lt003",
        name: "Zone",
        icons: {
            lst001: "assets/img/marker/location/zone-001.png",
            lst002: "assets/img/marker/location/zone-002.png",
            lst003: "assets/img/marker/location/zone-003.png"
        }
    },
    lt004: {
        id: "lt004",
        name: "Cluster",
        icons: {
            lst001: "assets/img/marker/location/cluster-001.png",
            lst002: "assets/img/marker/location/cluster-002.png",
            lst003: "assets/img/marker/location/cluster-003.png"
        }
    },
    lt005: {
        id: "lt005",
        name: "College",
        icons: {
            lst001: "assets/img/marker/location/college-001.png",
            lst002: "assets/img/marker/location/college-002.png",
            lst003: "assets/img/marker/location/college-003.png"
        }
    },
    lt006: {
        id: "lt006",
        name: "Factory",
        icons: {
            lst001: "assets/img/marker/location/factory-001.png",
            lst002: "assets/img/marker/location/factory-002.png",
            lst003: "assets/img/marker/location/factory-003.png"
        }
    },
    lt007: {
        id: "lt007",
        name: "Bank",
        icons: {
            lst001: "assets/img/marker/location/bank-001.png",
            lst002: "assets/img/marker/location/bank-002.png",
            lst003: "assets/img/marker/location/bank-003.png"
        }
    },
    lt008: {
        id: "lt008",
        name: "Hotel",
        icons: {
            lst001: "assets/img/marker/location/hotel-001.png",
            lst002: "assets/img/marker/location/hotel-002.png",
            lst003: "assets/img/marker/location/hotel-003.png"
        }
    },
    lt009: {
        id: "lt009",
        name: "Restaurant",
        icons: {
            lst001: "assets/img/marker/location/restaurant-001.png",
            lst002: "assets/img/marker/location/restaurant-002.png",
            lst003: "assets/img/marker/location/restaurant-003.png"
        }
    },
    lt010: {
        id: "lt010",
        name: "Store",
        icons: {
            lst001: "assets/img/marker/location/store-001.png",
            lst002: "assets/img/marker/location/store-002.png",
            lst003: "assets/img/marker/location/store-003.png"
        }
    },
    ltxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('DISASTER_TYPES', {
    dt001: {
        id: "dt001",
        name: "Fire",
        disasterReliefCentreTypeId: "ct002",
        medicalReliefRequired: true,
        icons: {
            lst002: "assets/img/status/location/fire-001.png",
            lst003: "assets/img/status/location/fire-002.png",
        }
    },
    dt002: {
        id: "dt002",
        name: "Flood",
        disasterReliefCentreTypeId: "ct001",
        medicalReliefRequired: true,
        icons: {
            lst002: "assets/img/status/location/flood-001.png",
            lst003: "assets/img/status/location/flood-002.png",
        }
    },
    dt003: {
        id: "dt003",
        name: "Cyclone",
        disasterReliefCentreTypeId: "ct001",
        medicalReliefRequired: true,
        icons: {
            lst002: "assets/img/status/location/cyclone-001.png",
            lst003: "assets/img/status/location/cyclone-002.png",
        }
    },
    dt004: {
        id: "dt004",
        name: "Earthquake",
        disasterReliefCentreTypeId: "ct001",
        medicalReliefRequired: true,
        icons: {
            lst002: "assets/img/status/location/earthquake-001.png",
            lst003: "assets/img/status/location/earthquake-002.png",
        }
    },
    dt005: {
        id: "dt005",
        name: "Burglary",
        disasterReliefCentreTypeId: "ct003",
        medicalReliefRequired: false,
        icons: {
            lst002: "assets/img/status/location/burglary-001.png",
            lst003: "assets/img/status/location/burglary-002.png",
        }
    },
    dt006: {
        id: "dt006",
        name: "Robbery",
        disasterReliefCentreTypeId: "ct003",
        medicalReliefRequired: true,
        icons: {
            lst002: "assets/img/status/location/robbery-001.png",
            lst003: "assets/img/status/location/robbery-002.png",
        }
    }
});

app.constant('LOCATION_STATUSES', {
    lst001: {
        id: "lst001",
        name: "Normal",
        priority: 1,
        icon: "assets/img/status/location/normal.png"
    },
    lst002: {
        id: "lst002",
        name: "Serious",
        priority: 5
    },
    lst003: {
        id: "lst003",
        name: "Extreme",
        priority: 10
    },
    lstxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('MAP_SENSORS', {
    st001: {
        id: "st001",
        name: "Sensor",
        icons: {
            sst001: "assets/img/marker/sensor/sensor-001.png",
            sst002: "assets/img/marker/sensor/sensor-002.png",
            sst003: "assets/img/marker/sensor/sensor-003.png"
        }
    },
    st002: {
        id: "st002",
        name: "Thermometer",
        icons: {
            sst001: "assets/img/marker/sensor/thermometer-001.png",
            sst002: "assets/img/marker/sensor/thermometer-002.png",
            sst003: "assets/img/marker/sensor/thermometer-003.png"
        }
    },
    st003: {
        id: "st003",
        name: "Hygrometer",
        icons: {
            sst001: "assets/img/marker/sensor/hygrometer-001.png",
            sst002: "assets/img/marker/sensor/hygrometer-002.png",
            sst003: "assets/img/marker/sensor/hygrometer-003.png"
        }
    },
    st004: {
        id: "st004",
        name: "Udometer",
        icons: {
            sst001: "assets/img/marker/sensor/udometer-001.png",
            sst002: "assets/img/marker/sensor/udometer-002.png",
            sst003: "assets/img/marker/sensor/udometer-003.png"
        }
    },
    st005: {
        id: "st005",
        name: "Anemometer",
        icons: {
            sst001: "assets/img/marker/sensor/anemometer-001.png",
            sst002: "assets/img/marker/sensor/anemometer-002.png",
            sst003: "assets/img/marker/sensor/anemometer-003.png"
        }
    },
    st006: {
        id: "st006",
        name: "Gas-Sensor",
        icons: {
            sst001: "assets/img/marker/sensor/gas-sensor-001.png",
            sst002: "assets/img/marker/sensor/gas-sensor-002.png",
            sst003: "assets/img/marker/sensor/gas-sensor-003.png"
        }
    },
    st007: {
        id: "st007",
        name: "Motion-Sensor",
        icons: {
            sst001: "assets/img/marker/sensor/motion-sensor-001.png",
            sst002: "assets/img/marker/sensor/motion-sensor-002.png",
            sst003: "assets/img/marker/sensor/motion-sensor-003.png"
        }
    },
    st008: {
        id: "st008",
        name: "Alarm",
        icons: {
            sst001: "assets/img/marker/sensor/alarm-001.png",
            sst002: "assets/img/marker/sensor/alarm-002.png",
            sst003: "assets/img/marker/sensor/alarm-003.png"
        }
    },
    stxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('SENSOR_STATUSES', {
    sst001: {
        id: "sst001",
        name: "Normal",
        priority: 1,
        icon: "assets/img/status/sensor/normal.png"
    },
    sst002: {
        id: "sst002",
        name: "Failure",
        priority: 5,
        icon: "assets/img/status/sensor/failure.png"
    },
    sst003: {
        id: "sst003",
        name: "Abnormal",
        priority: 10,
        icon: "assets/img/status/sensor/abnormal.png"
    },
    sstxxx: {
        id: "*",
        name: "All"
    }
});

app.constant('MAP_ROUTES', {
    r001: {
        id: "r001",
        name: "Emergency Route",
        color: "#ce352c"
    },
    r002: {
        id: "r002",
        name: "Hospital Route",
        color: "#fa6800"
    },
    r003: {
        id: "r003",
        name: "Custom Route",
        color: "#000000"
    }
});


app.constant('MAP_GRAPHS', {
    g001: {
        id: "g001",
        name: "[ NO GRAPH SELECTED ]",
        description: "Default choice for graph menu.",
        color: "#ce352c"
    },
    g002: {
        id: "g002",
        name: "Disaster Relief Routes (Directions API Based)",
        description: "Show directions API based generated routes between disaster relief centres and sensors.",
        color: "#ce352c"
    },
    g003: {
        id: "g003",
        name: "Disaster Relief Routes (Line Based)",
        description: "Show line based generated routes between disaster relief centres and sensors.",
        color: "#ce352c"
    },
    g004: {
        id: "g004",
        name: "Medical Relief Routes (Directions API Based)",
        description: "Show directions API based generated routes between medical relief centres and sensors.",
        color: "#fa6800"
    },
    g005: {
        id: "g005",
        name: "Medical Relief Routes (Line Based)",
        description: "Show line based generated routes between medical relief centres and sensors.",
        color: "#fa6800"
    },
    g006: {
        id: "g006",
        name: "Custom Routes (Directions API Based)",
        description: "Show directions API based user generated route between relief centres and sensors.",
        color: "#000000"
    },
    g007: {
        id: "g007",
        name: "Custom Routes (Line Based)",
        description: "Show line based user generated route between relief centres and sensors.",
        color: "#000000"
    },
    g008: {
        id: "g008",
        name: "Connectivity Graph",
        description: "Show conectivity graph of nodes.",
        color: "#000000"
    },
    g009: {
        id: "g009",
        name: "Minimimum Spanning Tree",
        description: "Show minimimum spanning tree of nodes.",
        color: "#000000"

    }
});

app.constant('IMAGE_DATA', {
    id001: {
        id: "id001",
        name: "Map-Image",
        path: "assets/img/other/map.png",
    },
    id002: {
        id: "id002",
        name: "Search-Image",
        path: "assets/img/other/search.png",
    },
    id003: {
        id: "id003",
        name: "Route-Image-001",
        path: "assets/img/other/route-001.png"
    },
    id004: {
        id: "id004",
        name: "Route-Image-002",
        path: "assets/img/other/route-002.png"
    },
    id005: {
        id: "id005",
        name: "Route-Image-003",
        path: "assets/img/other/route-003.png"
    },
    id006: {
        id: "id006",
        name: "Info-Image",
        path: "assets/img/other/info.png",
    },
    id007: {
        id: "id007",
        name: "Login-Image",
        path: "assets/img/other/login.png",
    },
    id008: {
        id: "id008",
        name: "Logout-Image",
        path: "assets/img/other/logout.png",
    },
    id009: {
        id: "id009",
        name: "Default-Image",
        path: "assets/img/other/default-photo.png",
    }
});