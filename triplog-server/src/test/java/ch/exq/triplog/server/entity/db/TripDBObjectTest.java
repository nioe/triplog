package ch.exq.triplog.server.entity.db;

import org.junit.Before;
import org.junit.Test;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.Assert.*;

public class TripDBObjectTest {

    private TripDBObject tripDBObject;

    @Before
    public void setUp() throws Exception {
        this.tripDBObject = new TripDBObject();
        this.tripDBObject.setTripId("123");
        this.tripDBObject.setTripName("Bla");
        this.tripDBObject.setTripDescription("Description");
        this.tripDBObject.setLegs(Arrays.asList("123"));
    }

    @Test
    public void testUpdateFrom_TripName() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setTripName("Blubb");

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Blubb", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripDescription());
        assertNotNull(this.tripDBObject.getLegs());
        assertTrue(this.tripDBObject.getLegs().containsAll(Arrays.asList("123")));
    }

    @Test
    public void testUpdateFrom_TripDescription() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setTripDescription("New Desc");

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("New Desc", this.tripDBObject.getTripDescription());
        assertNotNull(this.tripDBObject.getLegs());
        assertTrue(this.tripDBObject.getLegs().containsAll(Arrays.asList("123")));
    }

    @Test
    public void testUpdateFrom_EmptyLegList() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setLegs(new ArrayList<>());

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripDescription());
        assertNotNull(this.tripDBObject.getLegs());
        assertTrue(this.tripDBObject.getLegs().containsAll(Arrays.asList("123")));
    }

    @Test
    public void testUpdateFrom_Legs() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setLegs(Arrays.asList("456", "789"));

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripDescription());
        assertNotNull(this.tripDBObject.getLegs());
        assertTrue(this.tripDBObject.getLegs().containsAll(Arrays.asList("456", "789")));
    }
}