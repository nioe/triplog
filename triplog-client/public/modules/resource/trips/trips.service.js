'use strict';

// @ngInject
function TripsService($rootScope, $q, $filter, TripsResource, localStorageService, TRIP_STORAGE_KEYS, ENV) {

    function getAllTrips() {
        if ($rootScope.isOnline || ENV === 'local') {
            return TripsResource.query().$promise.then(function (tripData) {
                sortByPropertyDescending(tripData, 'tripDate');

                tripData.forEach(function (trip) {
                    trip.displayName = trip.tripName + ' ' + $filter('date')(trip.tripDate, 'yyyy');

                    sortByPropertyDescending(trip.steps, 'fromDate');
                });

                localStorageService.set($rootScope.loggedIn ? TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN : TRIP_STORAGE_KEYS.ALL_TRIPS, tripData);

                return tripData;
            }, function (error) {
                if (error.status === 0) {
                    var storedTrips = getTripsFromLocalStorage();
                    if (storedTrips) {
                        return storedTrips;
                    }
                }

                return $q.reject(error);
            });
        } else {
            return $q(function (resolve, reject) {
                var storedTrips = getTripsFromLocalStorage();
                if (storedTrips) {
                    resolve(storedTrips);
                } else {
                    reject({
                        status: 'offline',
                        data: 'You seem to be offline and there are no stored trips to show... :('
                    });
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
                return $q.reject({
                    status: 404,
                    data: 'Trip with ID ' + tripId + ' could not be found.'
                });
            }
        });
    }

    function sortByPropertyDescending(arr, property) {
        arr.sort(function (a, b) {
            if (a[property] > b[property]) {
                return -1;
            }

            if (a[property] < b[property]) {
                return 1;
            }

            return 0;
        });
    }

    function getTripsFromLocalStorage() {
        var storedTrips;
        if ($rootScope.loggedIn) {
            storedTrips = localStorageService.get(TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN);
        }

        if (!storedTrips || storedTrips.length === 0) {
            storedTrips = localStorageService.get(TRIP_STORAGE_KEYS.ALL_TRIPS);
        }

        return storedTrips && storedTrips.length > 0 ? storedTrips : undefined;
    }

    return {
        getAllTrips: getAllTrips,
        getTripById: getTripById
    };
}

module.exports = TripsService;