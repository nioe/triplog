package ch.exq.triplog.server.util.mapper.mappings;

import ch.exq.triplog.server.entity.db.TripDBObject;
import ch.exq.triplog.server.dto.Trip;
import org.junit.Before;
import org.junit.Test;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;

import static org.junit.Assert.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 08:28
 */
public class DBObjectToTripMapTest {

    private ModelMapper mapper;

    @Before
    public void setUp() {
        mapper = new ModelMapper();
        mapper.addMappings(new DBObjectToTripMap());
    }

    @Test
    public void testMapTripId() {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripId("123");

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertEquals("123", trip.getTripId());
        assertNull(trip.getTripName());
        assertNull(trip.getTripDescription());
        assertNotNull(trip.getLegs());
        assertEquals(0, trip.getLegs().size());
    }

    @Test
    public void testMapTripName() {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripName("test_trip");

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertEquals("test_trip", trip.getTripName());
        assertNull(trip.getTripDescription());
        assertNotNull(trip.getLegs());
        assertEquals(0, trip.getLegs().size());
    }

    @Test
    public void testMapTripDescription() {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripDescription("test_trip_desc");

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertNull(trip.getTripName());
        assertEquals("test_trip_desc", trip.getTripDescription());
        assertNotNull(trip.getLegs());
        assertEquals(0, trip.getLegs().size());
    }

    @Test
    public void testMapLegs() {
        TripDBObject tripDBObject = new TripDBObject();
        ArrayList<String> legs = new ArrayList<>();
        legs.add("123");
        legs.add("456");
        tripDBObject.setLegs(legs);

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertNull(trip.getTripName());
        assertNull(trip.getTripDescription());
        assertNotNull(trip.getLegs());
        assertEquals(legs.size(), trip.getLegs().size());
        assertTrue(trip.getLegs().containsAll(legs));
    }
}
