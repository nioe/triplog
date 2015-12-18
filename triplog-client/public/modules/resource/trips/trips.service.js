'use strict';

// @ngInject
function TripsService($rootScope, $q, $filter, TripsResource, localStorageService, TRIP_STORAGE_KEYS, ENV) {

    return {
        getTrips: getTrips,
        getTrip: getTrip,
        deleteTrip: deleteTrip
    };

    function getTrips() {
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

    function getTrip(tripId) {
        return getTrips().then(function (allTrips) {
            var trip = getTripWithId(tripId, allTrips);

            return trip ? trip : $q.reject({
                status: 404,
                data: 'Trip with ID ' + tripId + ' could not be found.'
            });
        });
    }

    function deleteTrip(tripId) {
        if ($rootScope.isOnline || ENV === 'local') {
            return TripsResource.delete({tripId: tripId}).$promise.then(deleteTripFromLocalStorage.bind(undefined, tripId), function (error) {
                if (error && error.status === 404) {
                    return $q.reject({
                        status: 404,
                        data: 'Trip with ID ' + tripId + ' could not be found.'
                    });
                }

                return saveTripToBeDeleted(tripId, {
                    status: 0,
                    data: 'Trip with ID ' + tripId + ' could not be deleted at the moment. However it is marked to be deleted in the future.'
                });
            });
        } else {
            return saveTripToBeDeleted(tripId, {
                status: 'offline',
                data: 'You seem to be offline. Therefore the trip with the ID ' + tripId + ' could only be deleted locally. It will be deleted on the server as soon as you have a internet connection'
            });
        }
    }


    /******************************** Private functions ********************************/

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

    function getTripWithId(tripId, allTrips) {
        var tripsWithGivenId = allTrips.filter(function (trip) {
            return trip.tripId === tripId;
        });

        return tripsWithGivenId.length > 0 ? tripsWithGivenId[0] : undefined;
    }

    function deleteTripFromLocalStorage(tripId) {
        var deleteTripFromLocalStorageWithKey = function(tripId, localStorageKey) {
            var storedTrips = localStorageService.get(localStorageKey);

            if (storedTrips) {
                localStorageService.set(localStorageKey, storedTrips.filter(function (trip) {
                    return trip.tripId !== tripId;
                }));
            }
        };

        deleteTripFromLocalStorageWithKey(tripId, TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN);
        deleteTripFromLocalStorageWithKey(tripId, TRIP_STORAGE_KEYS.ALL_TRIPS);
    }

    function saveTripToBeDeleted(tripId, error) {
        var tripsToDelete = localStorageService.get(TRIP_STORAGE_KEYS.TRIPS_TO_DELETE);

        if (!tripsToDelete) {
            tripsToDelete = [];
        }

        tripsToDelete.push(tripId);
        localStorageService.set(TRIP_STORAGE_KEYS.TRIPS_TO_DELETE, tripsToDelete);

        return $q(function (resolve, reject) {
            if (error) {
                reject(error);
            }

            resolve();
        });
    }
}

module.exports = TripsService;