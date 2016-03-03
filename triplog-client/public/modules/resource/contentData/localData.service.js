'use strict';

module.exports = LocalDataService;

// @ngInject
function LocalDataService($rootScope, $log, $filter, localStorageService, CONTENT_DATA_STORAGE_KEYS) {

    return {
        getTrips: getTrips,
        tripsLoaded: tripsLoaded,
        getTrip: getTrip,
        addTrip: addTrip,
        updateTrips: updateTrips,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip
    };

    function getTrips() {
        return localStorageService.get(tripsKey()) || [];
    }

    function tripsLoaded() {
        return getTrips().length > 0;
    }

    function getTrip(tripId) {
        var tripsWithGivenId = getTrips().filter(function (trip) {
            return trip.tripId === tripId;
        });

        return tripsWithGivenId.length > 0 ? tripsWithGivenId[0] : undefined;
    }

    function addTrip(trip) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to add trip ' + trip.tripName);
            return;
        }

        var trips = getTrips();
        trips.push(trip);
        updateTrips(trips);
    }

    function updateTrips(trips) {
        localStorageService.set(tripsKey(), reviseTrips(trips));
    }

    function updateTrip(trip) {
        var tripId = trip.tripId;

        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to replace trip ' + tripId);
            return;
        }

        deleteTrip(tripId);
        addTrip(trip);

        return getTrip(tripId);
    }

    function deleteTrip(tripId) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to delete trip ' + tripId);
            return;
        }

        var trips = getTrips();

        if (trips) {
            updateTrips(trips.filter(function (trip) {
                return trip.tripId !== tripId;
            }));
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function reviseTrips(trips) {
        sortByPropertyDescending(trips, 'tripDate');

        trips.forEach(function (trip) {
            var tripYear = $filter('date')(trip.tripDate, 'yyyy');
            trip.displayName = trip.tripName + ' ' + tripYear;

            if (!trip.tripId) {
                // If a new trip is only stored locally there is no tripId yet. Therefore we need to create one.

            }

            sortByPropertyDescending(trip.steps, 'fromDate');
        });

        return trips;
    }

    function tripsKey() {
        return $rootScope.loggedIn ? CONTENT_DATA_STORAGE_KEYS.ALL_TRIPS_ADMIN : CONTENT_DATA_STORAGE_KEYS.ALL_TRIPS;
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
}
