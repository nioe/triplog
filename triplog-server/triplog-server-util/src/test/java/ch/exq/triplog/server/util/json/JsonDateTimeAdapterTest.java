package ch.exq.triplog.server.util.json;

import org.junit.Before;
import org.junit.Test;

import java.time.LocalDateTime;

import static org.junit.Assert.assertEquals;

public class JsonDateTimeAdapterTest {

    private static final String DATE_STRING = "2014-08-22T15:56:13";
    private static final LocalDateTime DATE = LocalDateTime.of(2014, 8, 22, 15, 56, 13);

    private JsonDateTimeAdapter adapter;

    @Before
    public void setUp() throws Exception {
        adapter = new JsonDateTimeAdapter();
    }

    @Test
    public void unmarshal() throws Exception {
        LocalDateTime actual = adapter.unmarshal(DATE_STRING);
        assertEquals(DATE, actual);
    }

    @Test
    public void marshal() throws Exception {
        String actual = adapter.marshal(DATE);
        assertEquals(DATE_STRING, actual);
    }
}
