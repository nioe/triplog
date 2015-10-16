'use strict';

// @ngInject
function AlertService($rootScope) {
    function alert(type, msg) {
        $rootScope.alerts.push({
            type: type,
            msg: msg
        });
    }

    return {
        success: alert.bind(undefined, 'success'),
        info: alert.bind(undefined, 'info'),
        warning: alert.bind(undefined, 'warning'),
        error: alert.bind(undefined, 'danger')
    };
}

module.exports = AlertService;