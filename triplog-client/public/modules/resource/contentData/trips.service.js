'use strict';

module.exports = TripsService;

// @ngInject
function TripsService($rootScope, $q, $log, ProcessQueue, LocalData, TripsResource, ENV) {

    return {
        ensureTripsAreFetched: ensureTripsAreFetched,
        fetchTrips: fetchTrips,
        createTrip: createTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip
    };

    function ensureTripsAreFetched() {
        if (LocalData.tripsAreLoaded) {
            fetchTrips(); // Fetch trips in background
            return $q.resolve(LocalData.getTrips);
        }

        return fetchTrips();
    }

    function fetchTrips() {
        if ($rootScope.isOnline || ENV === 'local') {
            $log.info('Fetching trips from server...');

            return TripsResource.query().$promise.then(
                updateAndResolveTrips,
                rejectWithMessage.bind(null, 'Trips could not be fetched from server and there are no locally cached trips.')
            );
        } else {
            $log.warn('Offline -> Cannot fetch trips!');
            return rejectWithMessage('You seem to be offline. Trips could not be loaded...', {status: 'offline'});
        }
    }
    
    function createTrip(trip) {
        LocalData.addOrReplaceTrip(trip);
        ProcessQueue.enqueue('TripsResource', 'create', undefined, trip);
    }

    function updateTrip(trip) {
        LocalData.updateTrip(trip);
        
        if (trip.onlyLocal) {
            ProcessQueue.enqueue('TripsResource', 'create', undefined, trip);
        } else {
            ProcessQueue.enqueue('TripsResource', 'update', {tripId: trip.tripId}, trip);
        }
    }

    function deleteTrip(tripId, onlyLocal) {
        LocalData.deleteTrip(tripId);
        
        if (onlyLocal) {
            ProcessQueue.remove('TripsResource', 'create', undefined, {tripId: tripId});
        } else {
            ProcessQueue.enqueue('TripsResource', 'delete', {tripId: tripId});
        }
    }

    /*********************************************** Private Functions ***********************************************/

    function updateAndResolveTrips(trips) {
        LocalData.updateTrips(trips);
        return LocalData.getTrips;
    }

    function rejectWithMessage(message, error) {
        return $q.reject({
            status: error.status,
            data: message
        });
    }
}
