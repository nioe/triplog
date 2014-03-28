package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.Trip;

import javax.annotation.PostConstruct;
import javax.ejb.Stateless;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
@Stateless
public class TripDAO {

    private Map<Integer, Trip> trips;

    @PostConstruct
    public void setUp() {
        trips = new HashMap<>();
        trips.put(1, new Trip(1, "First Trip", "This is my very first trip! :)"));
        trips.put(2, new Trip(2, "Maldives", "Diving on the Maldives!"));
    }

    public List<Trip> getAllTrips() {
        return new ArrayList<>(trips.values());
    }

    public Trip getTripById(int tripId) {
        return trips.get(tripId);
    }
}
