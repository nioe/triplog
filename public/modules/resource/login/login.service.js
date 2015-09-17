'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, localStorageService, REST_URL_PREFIX, LOGIN_STORAGE_KEYS) {

    function login(username, password) {
        if ($rootScope.isOnline) {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE, username);
                localStorageService.set(LOGIN_STORAGE_KEYS.AUTH_TOKEN, response.data);

                $http.defaults.headers.common['X-AUTH-TOKEN'] = response.data.id;

                $rootScope.loggedIn = true;
                $rootScope.$broadcast('loginStateChanged', {
                    loggedIn: true
                });

                return response;
            });
        } else {
            return checkLocalStorageIfUserHasBeenLoggedInBefore();
        }
    }

    function logout() {
        return $http({
            method: 'POST',
            url: REST_URL_PREFIX + '/logout'
        }).then(resetLoggedInStatus, function(response) {
            if (response.status === 401) {
                resetLoggedInStatus();
            }
        });
    }

    function callLoginService(username, password) {
        var auth = btoa(username + ':' + password);

        return $http({
            method: 'POST',
            url: REST_URL_PREFIX + '/login',
            headers: {
                'Authorization': 'Basic ' + auth
            }
        });
    }

    function checkLocalStorageIfUserHasBeenLoggedInBefore(username) {
        $q(function (resolve, reject) {
            if (localStorageService.get(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE) === username) {
                resolve({
                    id: 'localToken'
                });
            } else {
                reject('You seem to be offline and can therefore not login');
            }
        });
    }

    function resetLoggedInStatus() {
        localStorageService.remove(LOGIN_STORAGE_KEYS.AUTH_TOKEN);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;

        $rootScope.$broadcast('loginStateChanged', {
            loggedIn: false
        });
    }

    return {
        login: login,
        logout: logout
    };
}

module.exports = LoginService;