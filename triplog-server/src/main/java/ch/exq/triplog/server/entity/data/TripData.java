package ch.exq.triplog.server.entity.data;

import ch.exq.triplog.server.entity.Trip;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import java.util.HashMap;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 * Can be removed after db has been introduced!
 */

@ApplicationScoped
public class TripData {

    private HashMap<Integer, Trip> trips;

    @PostConstruct
    public void setUp() {
        trips = new HashMap<>();
        trips.put(1, new Trip(1, "First Trip", "This is my very first trip! :)"));
        trips.put(2, new Trip(2, "Maldives", "Diving on the Maldives!"));
    }

    public HashMap<Integer, Trip> getTrips() {
        return trips;
    }

    public Trip addTrip(Trip trip) {
        int id = getNextKey();
        trip.setTripId(id);
        trips.put(id, trip);

        return trip;
    }

    private int getNextKey() {
        return trips.size() + 1;
    }
}
