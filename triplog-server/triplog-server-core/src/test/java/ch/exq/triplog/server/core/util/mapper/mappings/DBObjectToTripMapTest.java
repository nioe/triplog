package ch.exq.triplog.server.core.util.mapper.mappings;

import ch.exq.triplog.server.core.dto.Trip;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
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
        assertNotNull(trip.getSteps());
        assertEquals(0, trip.getSteps().size());
    }

    @Test
    public void testMapTripName() {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripName("test_trip");

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertEquals("test_trip", trip.getTripName());
        assertNull(trip.getTripDescription());
        assertNotNull(trip.getSteps());
        assertEquals(0, trip.getSteps().size());
    }

    @Test
    public void testMapTripDescription() {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripDescription("test_trip_desc");

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertNull(trip.getTripName());
        assertEquals("test_trip_desc", trip.getTripDescription());
        assertNotNull(trip.getSteps());
        assertEquals(0, trip.getSteps().size());
    }

    @Test
    public void testMapSteps() {
        TripDBObject tripDBObject = new TripDBObject();
        ArrayList<String> steps = new ArrayList<>();
        steps.add("123");
        steps.add("456");
        tripDBObject.setSteps(steps);

        Trip trip = mapper.map(tripDBObject, Trip.class);
        assertNull(trip.getTripId());
        assertNull(trip.getTripName());
        assertNull(trip.getTripDescription());
        assertNotNull(trip.getSteps());
        assertEquals(steps.size(), trip.getSteps().size());
        assertTrue(trip.getSteps().containsAll(steps));
    }
}
