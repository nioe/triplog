'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, localStorageService, REST_URL_PREFIX, STORAGE_KEYS) {

    function login(username, password) {
        if ($rootScope.isOnline) {
            return callLoginService(username, password).then(function (token) {
                localStorageService.set(STORAGE_KEYS.LOGGED_IN_BEFORE, username);
                return token;
            });
        } else {
            return checkLocalStorageIfUserHasBeenLoggedInBefore();
        }
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

    return {
        login: login
    };
}

module.exports = LoginService;