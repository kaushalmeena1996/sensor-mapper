firebase
    .initializeApp({
        apiKey: "AIzaSyCHZINWnMlvnlvcetBETCzqEMnh3aYtveU",
        authDomain: "mapmysensor.firebaseapp.com",
        databaseURL: "https://mapmysensor.firebaseio.com",
        projectId: "mapmysensor",
        storageBucket: "mapmysensor.appspot.com",
        messagingSenderId: "833622353265"
    });

$(window).on('load', function () {
    $(".ploader").fadeOut("fast");
});