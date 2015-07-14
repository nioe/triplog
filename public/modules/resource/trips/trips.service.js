'use strict';

// @ngInject
function TripsService($rootScope, $q, TripsResource, localStorageService, STORAGE_KEYS) {

    function getAllTrips() {
        console.log('online', $rootScope.isOnline);
        console.log('$q', $q);
        console.log('TripsResource', TripsResource);
        console.log('localStorageService', localStorageService);
        console.log('STORAGE_KEYS', STORAGE_KEYS);

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