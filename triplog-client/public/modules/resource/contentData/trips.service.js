'use strict';

module.exports = TripsService;

// @ngInject
function TripsService($rootScope, $q, $log, ProcessQueue, LocalData, TripsResource) {

    return {
        ensureTripsFetched: ensureTripsFetched,
        fetchTrips: fetchTrips,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip
    };

    function ensureTripsFetched() {
        if (LocalData.tripsLoaded) {
            fetchTrips(); // Fetch trips in background
            return $q.resolve(LocalData.getTrips);
        }

        return fetchTrips();
    }

    function fetchTrips() {
        if ($rootScope.isOnline) {
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

    function updateTrip(trip) {
        LocalData.updateTrip(trip);
        ProcessQueue.enqueue('TripsResource', 'update', {tripId: trip.tripId}, trip);
    }

    function deleteTrip(tripId) {
        LocalData.deleteTrip(tripId);
        ProcessQueue.enqueue('TripsResource', 'delete', {tripId: tripId});
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
