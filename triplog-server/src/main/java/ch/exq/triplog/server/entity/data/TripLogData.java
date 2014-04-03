package ch.exq.triplog.server.entity.data;

import ch.exq.triplog.server.entity.Leg;
import ch.exq.triplog.server.entity.Trip;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import java.util.Arrays;
import java.util.HashMap;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 * Can be removed after db has been introduced!
 */

@ApplicationScoped
public class TripLogData {

    private HashMap<String, Trip> trips;
    private HashMap<String, Leg> legs;

    @PostConstruct
    public void setUp() {
        trips = new HashMap<>();
        legs = new HashMap<>();

        Leg leg1 = new Leg("1st Leg", "This is the first leg of my first Trip", null);
        legs.put(leg1.getLegId(), leg1);

        Leg leg2 = new Leg("2nd Leg", "Foo", null);
        legs.put(leg2.getLegId(), leg2);

        Trip trip1 = new Trip("First Trip", "This is my very first trip! :)");
        trips.put(trip1.getTripId(), trip1);
        trips.get(trip1.getTripId()).getLegs().addAll(Arrays.asList(leg1.getLegId(), leg2.getLegId()));

        Trip trip2 = new Trip("Maldives", "Diving on the Maldives!");
        trips.put(trip2.getTripId(), trip2);
    }

    public HashMap<String, Trip> getTrips() {
        return trips;
    }

    public HashMap<String, Leg> getLegs() {
        return legs;
    }

    public Trip addTrip(Trip trip) {
        trips.put(trip.getTripId(), trip);
        return trip;
    }

    public Leg addLeg(String tripId, Leg leg) {
        if (!trips.containsKey(tripId)) {
            return null;
        }

        trips.get(tripId).getLegs().add(leg.getLegId());
        legs.put(leg.getLegId(), leg);

        return leg;
    }
}
