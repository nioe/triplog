package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.data.TripData;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
@Stateless
public class TripDAO {

    @Inject
    TripData trips;

    public List<Trip> getAllTrips() {
        return new ArrayList<>(trips.getTrips().values());
    }

    public Trip getTripById(int tripId) {
        return trips.getTrips().get(tripId);
    }

    public Trip createTrip(Trip trip) {
        return trips.addTrip(trip);
    }
}
