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

    function addOrReplaceTrip(trip, artificialTripId) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to add trip ' + trip.tripName);
            return;
        }

        var tripId = artificialTripId || trip.tripId,
            trips = getTrips().filter(function (trip) {
                return trip.tripId !== tripId;
            });

        trips.push(trip);
        updateTrips(trips);
    }

    function updateTrips(trips) {
        localStorageService.set(tripsKey(), reviseTrips(trips));
        $rootScope.$broadcast(EVENT_NAMES.localStorageUpdated);
    }

    function updateTrip(trip) {
        var tripId = trip.tripId;

        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to replace trip ' + tripId);
            return;
        }

        deleteTrip(tripId);
        addOrReplaceTrip(trip);

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

    function getStep(tripId, stepId) {
        var allSteps = loadAllSteps();
        return allSteps[tripId] ? allSteps[tripId][stepId] : undefined;
    }

    function stepIsLoaded(tripId, stepId) {
        return !!getStep(tripId, stepId);
    }

    function addOrReplaceStep(step, artificialStepId) {
        var allSteps = loadAllSteps();

        if (!allSteps[step.tripId]) {
            allSteps[step.tripId] = {};
        }

        if (artificialStepId) {
            deleteStep(step.tripId, artificialStepId);
        }

        var revisedStep = reviseStep(step);
        allSteps[step.tripId][step.stepId] = revisedStep;
        updateAllSteps(allSteps);

        addOrReplaceStepOnTrip(revisedStep, artificialStepId);
    }

    function deleteStep(tripId, stepId) {
        if (!$rootScope.loggedIn) {
            $log.warn('You need to be logged in to delete step ' + tripId + '/' + stepId);
            return;
        }

        var allSteps = loadAllSteps();
        delete allSteps[tripId][stepId];
        updateAllSteps(allSteps);
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
            var trip = getTrip(step.tripId),
                steps = trip.steps.filter(function (stepOnTrip) {
                    return !(stepOnTrip.stepId === artificialStepId || stepOnTrip.stepId === step.stepId);
                });

            steps.push(step);
            trip.steps = steps;
            sortByPropertyDescending(trip.steps, 'fromDate');

            updateTrip(trip);
        }
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

    function updateAllSteps(steps) {
        localStorageService.set(LOCAL_STORAGE_KEYS.steps, steps);
        $rootScope.$broadcast(EVENT_NAMES.localStorageUpdated);
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
