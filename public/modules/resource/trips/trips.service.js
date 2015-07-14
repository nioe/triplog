'use strict';

// @ngInject
function TripsService($rootScope, $q, TripsResource, localStorageService, STORAGE_KEYS) {

    function getAllTrips() {
        if ($rootScope.isOnline) {
            return TripsResource.query().$promise.then(function (tripData) {
                localStorageService.set(STORAGE_KEYS.ALL_TRIPS, tripData);
                return tripData;
            });
        } else {
            return $q(function (resolve, reject) {
                var storedTrips = localStorageService.get(STORAGE_KEYS.ALL_TRIPS);
                if (storedTrips && storedTrips[0]) {
                    resolve(storedTrips);
                } else {
                    reject('There are no stored trips');
                }
            });
        }
    }

    return {
        getAllTrips: getAllTrips
    };
}

module.exports = TripsService;