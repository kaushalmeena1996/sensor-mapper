/**
 * @ngdoc service
 * @name app.AuthService
 * 
 * @description
 * Handle the authentication of application to the firbase
 * server
 *
 **/

var app = angular.module('app');

app.factory('AuthService', function ($rootScope, AUTH_EVENTS, STATUS_CODES) {
    var authService = {};

    var userData = {},
        userSignedIn = false;

    function login(credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
            .then(function (data) {
                userData = data.user;
                userSignedIn = true;
                $rootScope.email = userData.email;
                $rootScope.$emit(AUTH_EVENTS.signIn, {
                    statusCode: STATUS_CODES.signInSuccessful,
                    userData: userData
                });
            })
            .catch(function (error) {
                $rootScope.$emit(AUTH_EVENTS.signIn, {
                    statusCode: STATUS_CODES.signInFailed,
                    message: error.message
                });
            });
    };

    function logout() {
        firebase.auth().signOut()
            .then(function () {
                userData = {};
                userSignedIn = false;
                $rootScope.email = '';
                $rootScope.$emit(AUTH_EVENTS.signOut, {
                    statusCode: STATUS_CODES.signOutSuccessful
                });
            })
            .catch(function (error) {
                $rootScope.$emit(AUTH_EVENTS.signOut, {
                    statusCode: STATUS_CODES.signOutFailed,
                    message: error.message
                });
            });
    };

    authService.signIn = function (credentials, scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (userSignedIn == true) {
            $rootScope.$emit(AUTH_EVENTS.signIn, {
                statusCode: STATUS_CODES.signInSuccessful,
                userData: userData
            });
        } else {
            login(credentials);
        }

        scope.$on('$destroy', handler);
    };

    authService.signOut = function (scope, event, callback) {
        var handler = $rootScope.$on(event, callback);

        if (userSignedIn == false) {
            $rootScope.$emit(AUTH_EVENTS.signOut, {
                statusCode: STATUS_CODES.signOutSuccessful
            });
        } else {
            logout();
        }

        scope.$on('$destroy', handler);
    };

    authService.signedIn = function () {
        return userSignedIn;
    };

    authService.getUserData = function () {
        return userData;
    };

    return authService;
});