package ch.exq.triplog.server.util.json;

import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;

import static org.junit.Assert.assertEquals;

public class JsonDateAdapterTest {
    private static final String DATE_STRING = "2014-08-25";
    private static final LocalDate DATE = LocalDate.of(2014, 8, 25);

    private JsonDateAdapter adapter;

    @Before
    public void setUp() throws Exception {
        adapter = new JsonDateAdapter();
    }

    @Test
    public void unmarshal() throws Exception {
        LocalDate actual = adapter.unmarshal(DATE_STRING);
        assertEquals(DATE, actual);
    }

    @Test
    public void marshal() throws Exception {
        String actual = adapter.marshal(DATE);
        assertEquals(DATE_STRING, actual);
    }
}