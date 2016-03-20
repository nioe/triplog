'use strict';

// @ngInject
function LoginService($rootScope, $q, $http, $state, localStorageService, REST_URL_PREFIX, LOCAL_STORAGE_KEYS, ENV, EVENT_NAMES) {

    function login(username, password) {
        if ($rootScope.isOnline || ENV === 'local') {
            return callLoginService(username, password).then(function (response) {
                localStorageService.set(LOCAL_STORAGE_KEYS.loggedInBefore, username);

                setLoggedInStatus(response.data.id);

                return response;
            }, function (error) {
                if (error.status === -1) {
                    // Backend not available
                    return checkLocalStorageIfUserHasBeenLoggedInBefore(username);
                }

                return $q.reject(error);
            });
        } else {
            return checkLocalStorageIfUserHasBeenLoggedInBefore(username);
        }
    }

    function logout() {
        return $http({
            method: 'POST',
            url: REST_URL_PREFIX + '/logout'
        }).then(resetLoggedInStatus, function(error) {
            if ([-1, 0, 401].indexOf(error.status) !== -1) {
                resetLoggedInStatus();
            } else {
                $q.reject(error);
            }
        });
    }

    function checkPresentToken() {
        var xAuthToken = localStorageService.get(LOCAL_STORAGE_KEYS.authToken);

        if (xAuthToken) {
            var promise;

            if (xAuthToken === 'localToken') {
                promise = $q.resolve();
            } else {
                promise = $http({
                    method: 'POST',
                    url: REST_URL_PREFIX + '/tokenValidator',
                    headers: {
                        'X-AUTH-TOKEN': xAuthToken
                    }
                });
            }

            return promise.then(setLoggedInStatus.bind(undefined, xAuthToken), resetLoggedInStatusAndGoToTripOverviewPage);
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
                setLoggedInStatus('localToken');
                resolve();
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

        localStorageService.set(LOCAL_STORAGE_KEYS.authToken, xAuthToken);

        $http.defaults.headers.common['X-AUTH-TOKEN'] = xAuthToken;
        $rootScope.loggedIn = true;
        $rootScope.xAuthToken = xAuthToken;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function resetLoggedInStatus() {
        var originalLoginStatus = $rootScope.loggedIn;

        localStorageService.remove(LOCAL_STORAGE_KEYS.authToken);
        $http.defaults.headers.common['X-AUTH-TOKEN'] = undefined;
        $rootScope.loggedIn = false;
        $rootScope.xAuthToken = undefined;

        reactOnLoggedInStatusChange(originalLoginStatus);
    }

    function resetLoggedInStatusAndGoToTripOverviewPage() {
        resetLoggedInStatus();
        $state.go('content.allTrips');
    }

    function reactOnLoggedInStatusChange(originalLoginStatus) {
        if (originalLoginStatus !== $rootScope.loggedIn) {
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