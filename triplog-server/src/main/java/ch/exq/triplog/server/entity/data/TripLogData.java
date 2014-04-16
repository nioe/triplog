package ch.exq.triplog.server.entity.data;

import ch.exq.triplog.server.service.dto.Leg;
import ch.exq.triplog.server.service.dto.Trip;
import ch.exq.triplog.server.util.UUIDUtil;

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
        //Sample Trips
        trips = new HashMap<>();
        Trip trip1 = new Trip("First Trip", "This is my very first trip! :)");
        trips.put(trip1.getTripId(), trip1);

        Trip trip2 = new Trip("Maldives", "Diving on the Maldives!");
        trips.put(trip2.getTripId(), trip2);

        //Sample Legs
        legs = new HashMap<>();
        Leg leg1 = new Leg(trip1.getTripId(), "1st Leg", "This is the first leg of my first Trip", null);
        legs.put(leg1.getLegId(), leg1);

        Leg leg2 = new Leg(trip1.getTripId(), "2nd Leg", "Foo", null);
        legs.put(leg2.getLegId(), leg2);

        trips.get(trip1.getTripId()).getLegs().addAll(Arrays.asList(leg1.getLegId(), leg2.getLegId()));
    }

    public HashMap<String, Trip> getTrips() {
        return trips;
    }

    public HashMap<String, Leg> getLegs() {
        return legs;
    }

    public Trip addTrip(Trip trip) {
        if (trip.getTripId() == null) {
            trip.setTripId(UUIDUtil.getRandumUUID());
        }
        trips.put(trip.getTripId(), trip);
        return trip;
    }

    public Leg addLeg(Leg leg) {
        if (!trips.containsKey(leg.getTripId())) {
            return null;
        }

        trips.get(leg.getTripId()).getLegs().add(leg.getLegId());
        legs.put(leg.getLegId(), leg);

        return leg;
    }
}
