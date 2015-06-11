package ch.exq.triplog.server.core.entity.db;

import org.junit.Before;
import org.junit.Test;

import java.lang.reflect.InvocationTargetException;

import static org.junit.Assert.assertEquals;

public class TripDBObjectTest {

    private TripDBObject tripDBObject;

    @Before
    public void setUp() throws Exception {
        this.tripDBObject = new TripDBObject();
        this.tripDBObject.setTripId("123");
        this.tripDBObject.setTripName("Bla");
        this.tripDBObject.setTripText("Description");
    }

    @Test
    public void testUpdateFrom_TripName() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setTripName("Blubb");

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Blubb", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripText());
    }

    @Test
    public void testUpdateFrom_TripDescription() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();
        other.setTripText("New Desc");

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("New Desc", this.tripDBObject.getTripText());
    }

    @Test
    public void testUpdateFrom_EmptyStepList() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripText());
    }

    @Test
    public void testUpdateFrom_Steps() throws InvocationTargetException, IllegalAccessException {
        TripDBObject other = new TripDBObject();

        this.tripDBObject.updateFrom(other);

        assertEquals("123", this.tripDBObject.getTripId());
        assertEquals("Bla", this.tripDBObject.getTripName());
        assertEquals("Description", this.tripDBObject.getTripText());
    }
}