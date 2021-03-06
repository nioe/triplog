'use strict';

module.exports = LocalDataService;

// @ngInject
function LocalDataService($rootScope, $log, $filter, localStorageService, LOCAL_STORAGE_KEYS, EVENT_NAMES) {

    var createGuid = require('./guid.fn.js');

    return {
        getTrips: getTrips,
        tripsAreLoaded: tripsAreLoaded,
        getTrip: getTrip,
        addOrReplaceTrip: addOrReplaceTrip,
        updateTrips: updateTrips,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip,

        getStep: getStep,
        stepIsLoaded: stepIsLoaded,
        addOrReplaceStep: addOrReplaceStep,
        deleteStep: deleteStep,

        isStepUnread: isStepUnread,
        markStepAsRead: markStepAsRead
    };

    function getTrips() {
        return localStorageService.get(tripsKey()) || [];
    }

    function tripsAreLoaded() {
        return getTrips().length > 0;
    }

    function getTrip(tripId) {
        var tripsWithGivenId = getTrips().filter(function (trip) {
            return trip.tripId === tripId;
        });

        return tripsWithGivenId.length > 0 ? tripsWithGivenId[0] : undefined;
    }

    function addOrReplaceTrip(trip, artificialTripId, noEvent) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to add trip ' + trip.tripName);
            return;
        }

        var tripId = artificialTripId || trip.tripId,
            trips = getTrips().filter(function (trip) {
                return trip.tripId !== tripId;
            });

        trips.push(trip);
        updateTrips(trips, noEvent);
    }

    function updateTrips(trips, noEvent) {
        localStorageService.set(tripsKey(), reviseTrips(trips));

        if (!noEvent) {
            $rootScope.$broadcast(EVENT_NAMES.localStorageUpdated);
        }
    }

    function updateTrip(trip, noEvent) {
        var tripId = trip.tripId;

        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to replace trip ' + tripId);
            return;
        }

        deleteTrip(tripId, true);
        addOrReplaceTrip(trip, noEvent);

        return getTrip(tripId);
    }

    function deleteTrip(tripId, noEvent) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to delete trip ' + tripId);
            return;
        }

        var trips = getTrips();

        if (trips) {
            updateTrips(trips.filter(function (trip) {
                return trip.tripId !== tripId;
            }), noEvent);
        }
    }

    function getStep(tripId, stepId) {
        var allSteps = loadAllSteps();
        return allSteps[tripId] ? allSteps[tripId][stepId] : undefined;
    }

    function stepIsLoaded(tripId, stepId) {
        return !!getStep(tripId, stepId);
    }

    function addOrReplaceStep(step, artificialStepId, noEvent) {
        var allSteps = loadAllSteps();

        if (!allSteps[step.tripId]) {
            allSteps[step.tripId] = {};
        }

        if (artificialStepId) {
            deleteStep(step.tripId, artificialStepId, true);
        }

        var revisedStep = reviseStep(step);
        allSteps[step.tripId][step.stepId] = revisedStep;
        updateAllSteps(allSteps, noEvent);

        addOrReplaceStepOnTrip(revisedStep, artificialStepId);
    }

    function deleteStep(tripId, stepId, noEvent) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to delete step ' + tripId + '/' + stepId);
            return;
        }

        var allSteps = loadAllSteps();
        delete allSteps[tripId][stepId];
        updateAllSteps(allSteps, noEvent);

        removeStepFromTrip(tripId, stepId);
    }

    function isStepUnread(step) {
        return getAllAlreadyReadSteps().indexOf(fullQualifiedStepName(step)) === -1;
    }

    function markStepAsRead(step) {
        if (isStepUnread(step)) {
            var readSteps = getAllAlreadyReadSteps();

            readSteps.push(fullQualifiedStepName(step));
            localStorageService.set(LOCAL_STORAGE_KEYS.alreadyReadSteps, readSteps);
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
                trip.tripId = createGuid();
                trip.onlyLocal = true;
            }

            sortByPropertyDescending(trip.steps || [], 'fromDate');
        });

        return trips;
    }

    function tripsKey() {
        return $rootScope.loggedIn ? LOCAL_STORAGE_KEYS.tripsAdmin : LOCAL_STORAGE_KEYS.trips;
    }

    function addOrReplaceStepOnTrip(step, artificialStepId) {
        if (step.onlyLocal || artificialStepId) {
            var trip = getTripWithoutStep(step.tripId, artificialStepId || step.stepId);
            trip.steps.push(step);
            updateTrip(trip);
        }
    }

    function removeStepFromTrip(tripId, stepId) {
        updateTrip(getTripWithoutStep(tripId, stepId));
    }

    function getTripWithoutStep(tripId, stepId) {
        var trip = getTrip(tripId);
        trip.steps = trip.steps.filter(function (stepOnTrip) {
            return stepOnTrip.stepId !== stepId;
        });

        return trip;
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

    function loadAllSteps() {
        return localStorageService.get(LOCAL_STORAGE_KEYS.steps) || {};
    }

    function updateAllSteps(steps, noEvent) {
        localStorageService.set(LOCAL_STORAGE_KEYS.steps, steps);

        if (!noEvent) {
            $rootScope.$broadcast(EVENT_NAMES.localStorageUpdated);
        }
    }

    function reviseStep(step) {
        if (!step.stepId) {
            // If a new step is only stored locally there is no stepId yet
            step.stepId = createGuid();
            step.onlyLocal = true;
        }

        return step;
    }

    function getAllAlreadyReadSteps() {
        return localStorageService.get(LOCAL_STORAGE_KEYS.alreadyReadSteps) || [];
    }

    function fullQualifiedStepName(step) {
        return step.tripId + '/' + step.stepId;
    }
}
