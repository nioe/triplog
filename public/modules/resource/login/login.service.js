'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, localStorageService, REST_URL_PREFIX, STORAGE_KEYS) {

    function login(username, password) {
        if ($rootScope.isOnline) {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(STORAGE_KEYS.LOGGED_IN_BEFORE, username);
                localStorageService.set(STORAGE_KEYS.AUTH_TOKEN, response.data);

                $http.defaults.headers.common['X-AUTH-TOKEN'] = response.data.id;

                console.log('Default Headers', $http.defaults.headers);

                $rootScope.loggedIn = true;

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
            if (localStorageService.get(STORAGE_KEYS.LOGGED_IN_BEFORE) === username) {
                resolve({
                    id: 'localToken'
                });
            } else {
                reject('You seem to be offline and can therefore not login');
            }
        });
    }

    function resetLoggedInStatus() {
        localStorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;
    }

    return {
        login: login,
        logout: logout
    };
}

module.exports = LoginService;