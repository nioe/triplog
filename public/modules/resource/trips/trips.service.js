'use strict';

// @ngInject
function TripsService($rootScope, $q, $filter, TripsResource, localStorageService, TRIP_STORAGE_KEYS) {

    function getAllTrips() {
        if ($rootScope.isOnline) {
            return TripsResource.query().$promise.then(function (tripData) {
                tripData.forEach(function (trip) {
                    trip.displayName = trip.tripName + ' ' + $filter('date')(trip.tripDate, 'yyyy');
                });

                localStorageService.set(TRIP_STORAGE_KEYS.ALL_TRIPS, tripData);

                return $filter('emptyTripFilter')(tripData);
            });
        } else {
            return $q(function (resolve, reject) {
                var storedTrips = localStorageService.get(TRIP_STORAGE_KEYS.ALL_TRIPS);
                if (storedTrips && storedTrips.length > 0) {
                    resolve($filter('emptyTripFilter')(storedTrips));
                } else {
                    reject('There are no stored trips');
                }
            });
        }
    }

    function getTripById(tripId) {
        return getAllTrips().then(function (allTrips) {
            var tripsWithGivenId = allTrips.filter(function (trip) {
                return trip.tripId === tripId;
            });

            if (tripsWithGivenId.length > 0) {
                return tripsWithGivenId[0];
            } else {
                return {};
            }
        });
    }

    return {
        getAllTrips: getAllTrips,
        getTripById: getTripById
    };
}

module.exports = TripsService;