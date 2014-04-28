package ch.exq.triplog.server.util.mapper.mappings;

import ch.exq.triplog.server.dto.Trip;
import ch.exq.triplog.server.entity.db.TripDBObject;
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
        assertNotNull(tripDBObject.getLegs());
        assertEquals(0, tripDBObject.getLegs().size());
    }

    @Test
    public void testMapTripName() {
        Trip trip = new Trip();
        trip.setTripName("trip_name");

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertEquals("trip_name", tripDBObject.getTripName());
        assertNull(tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getLegs());
        assertEquals(0, tripDBObject.getLegs().size());
    }

    @Test
    public void testMapTripDescription() {
        Trip trip = new Trip();
        trip.setTripDescription("trip_desc");

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertNull(tripDBObject.getTripName());
        assertEquals("trip_desc", tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getLegs());
        assertEquals(0, tripDBObject.getLegs().size());
    }

    @Test
    public void testMapLegs() {
        Trip trip = new Trip();
        ArrayList<String> legs = new ArrayList<>();
        legs.add("123");
        legs.add("456");
        trip.setLegs(legs);

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        assertNull(tripDBObject.getTripId());
        assertNull(tripDBObject.getTripName());
        assertNull(tripDBObject.getTripDescription());
        assertNotNull(tripDBObject.getLegs());
        assertEquals(legs.size(), tripDBObject.getLegs().size());
        assertTrue(tripDBObject.getLegs().containsAll(legs));
    }
}
