'use strict';

module.exports = UnauthorizedHttpInterceptor;

// @ngInject
function UnauthorizedHttpInterceptor($rootScope, $q, EVENT_NAMES) {
    return {
        responseError: responseError
    };

    function responseError(error) {
        if (error.status === 401 && $rootScope.$state.current.name !== 'content.login') {
            $rootScope.$broadcast(EVENT_NAMES.showLoginModal);
        }

        return $q.reject(error);
    }
}