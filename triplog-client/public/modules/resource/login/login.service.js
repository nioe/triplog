'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, $cacheFactory, localStorageService, REST_URL_PREFIX, LOGIN_STORAGE_KEYS, ENV) {

    function login(username, password) {
        if ($rootScope.isOnline || ENV === 'local') {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE, username);
                localStorageService.set(LOGIN_STORAGE_KEYS.AUTH_TOKEN, response.data.id);

                setLoggedInStatus(response.data.id);

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
        }).then(resetLoggedInStatus, function(error) {
            if (error.status === 401) {
                resetLoggedInStatus();
            } else {
                $q.reject(error);
            }
        });
    }

    function checkPresentToken() {
        var xAuthToken = localStorageService.get(LOGIN_STORAGE_KEYS.AUTH_TOKEN);
        if (xAuthToken) {
            $http({
                method: 'POST',
                url: REST_URL_PREFIX + '/tokenValidator',
                headers: {
                    'X-AUTH-TOKEN': xAuthToken
                }
            }).then(setLoggedInStatus.bind(undefined, xAuthToken), resetLoggedInStatus);
        } else {
            resetLoggedInStatus();
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
        return $q(function (resolve, reject) {
            if (localStorageService.get(LOGIN_STORAGE_KEYS.LOGGED_IN_BEFORE) === username) {
                resolve({
                    id: 'localToken'
                });
            } else {
                reject({
                    status: 'offline',
                    data: 'You seem to be offline and can therefore not login'
                });
            }
        });
    }

    function setLoggedInStatus(xAuthToken) {
        $http.defaults.headers.common['X-AUTH-TOKEN'] = xAuthToken;
        $rootScope.loggedIn = true;

        invalidateHttpCache();

        $rootScope.$broadcast('loginStateChanged', {
            loggedIn: true
        });
    }

    function resetLoggedInStatus() {
        localStorageService.remove(LOGIN_STORAGE_KEYS.AUTH_TOKEN);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;

        invalidateHttpCache();

        $rootScope.$broadcast('loginStateChanged', {
            loggedIn: false
        });
    }

    function invalidateHttpCache() {
        $cacheFactory.get('$http').removeAll();
    }

    return {
        login: login,
        logout: logout,
        checkPresentToken: checkPresentToken
    };
}

module.exports = LoginService;