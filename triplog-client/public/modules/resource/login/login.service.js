'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, $cacheFactory, localStorageService, REST_URL_PREFIX, LOCAL_STORAGE_KEYS, ENV, EVENT_NAMES) {

    function login(username, password) {
        if ($rootScope.isOnline || ENV === 'local') {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(LOCAL_STORAGE_KEYS.loggedInBefore, username);
                localStorageService.set(LOCAL_STORAGE_KEYS.authToken, response.data.id);

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
        var xAuthToken = localStorageService.get(LOCAL_STORAGE_KEYS.authToken);
        if (xAuthToken) {
            return $http({
                method: 'POST',
                url: REST_URL_PREFIX + '/tokenValidator',
                headers: {
                    'X-AUTH-TOKEN': xAuthToken
                }
            }).then(setLoggedInStatus.bind(undefined, xAuthToken), resetLoggedInStatus);
        } else {
            return $q.resolve().then(resetLoggedInStatus);
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
            if (localStorageService.get(LOCAL_STORAGE_KEYS.loggedInBefore) === username) {
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
        var originalLoginStatus = $rootScope.loggedIn;

        $http.defaults.headers.common['X-AUTH-TOKEN'] = xAuthToken;
        $rootScope.loggedIn = true;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function resetLoggedInStatus() {
        var originalLoginStatus = $rootScope.loggedIn;

        localStorageService.remove(LOCAL_STORAGE_KEYS.authToken);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function reactOnLoggedInStatusChange(originalLoginStatus) {
        if (originalLoginStatus !== $rootScope.loggedIn) {
            $cacheFactory.get('$http').removeAll();

            $rootScope.$broadcast(EVENT_NAMES.loginStateChanged, {
                loggedIn: $rootScope.loggedIn
            });
        }
    }

    return {
        login: login,
        logout: logout,
        checkPresentToken: checkPresentToken
    };
}

module.exports = LoginService;