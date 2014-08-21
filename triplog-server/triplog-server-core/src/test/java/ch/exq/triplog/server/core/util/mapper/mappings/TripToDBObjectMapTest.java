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
 * Date: 15.04.14
 * Time: 16:06
 */
public class TripToDBObjectMapTest {

    private ModelMapper mapper;

    @Before
    public void setUp() {
        mapper = new ModelMapper();
        mapper.addMappings(new TripToDBObjectMap());
    }

    @Test
    public void testMapId() {
        Trip trip = new Trip();
        trip.setTripId("123");

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertEquals("123", tripDBObject.getTripId());
        assertNull(tripDBObject.getTripName());
        assertNull(tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getSteps());
        assertEquals(0, tripDBObject.getSteps().size());
    }

    @Test
    public void testMapTripName() {
        Trip trip = new Trip();
        trip.setTripName("trip_name");

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertEquals("trip_name", tripDBObject.getTripName());
        assertNull(tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getSteps());
        assertEquals(0, tripDBObject.getSteps().size());
    }

    @Test
    public void testMapTripDescription() {
        Trip trip = new Trip();
        trip.setTripDescription("trip_desc");

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertNull(tripDBObject.getTripName());
        assertEquals("trip_desc", tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getSteps());
        assertEquals(0, tripDBObject.getSteps().size());
    }

    @Test
    public void testMapSteps() {
        Trip trip = new Trip();
        ArrayList<String> steps = new ArrayList<>();
        steps.add("123");
        steps.add("456");
        trip.setSteps(steps);

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertNull(tripDBObject.getTripName());
        assertNull(tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getSteps());
        assertEquals(steps.size(), tripDBObject.getSteps().size());
        assertTrue(tripDBObject.getSteps().containsAll(steps));
    }
}
