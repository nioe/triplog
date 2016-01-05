package ch.exq.triplog.server.util.json;

import org.junit.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

public class JsonDateTimeAdapterTest {

    private static final String DATE_STRING_OWN_FORMAT = "2014-08-22T15:56:13";
    private static final String DATE_STRING_JS_ISO_STRING = "2014-08-22T15:56:13.303Z";
    private static final LocalDateTime DATE = LocalDateTime.of(2014, 8, 22, 15, 56, 13);

    private JsonDateTimeAdapter adapter = new JsonDateTimeAdapter();

    @Test
    public void should_unmarshal_date_string_with_own_format() throws Exception {
        LocalDateTime actual = adapter.unmarshal(DATE_STRING_OWN_FORMAT);
        assertThat(actual).isEqualToIgnoringNanos(DATE);
    }

    @Test
    public void should_unmarshal_date_string_with_js_iso_format() throws Exception {
        LocalDateTime actual = adapter.unmarshal(DATE_STRING_JS_ISO_STRING);
        assertThat(actual).isEqualToIgnoringNanos(DATE);
    }

    @Test
    public void marshal() throws Exception {
        String actual = adapter.marshal(DATE);
        assertThat(actual).isEqualTo(DATE_STRING_OWN_FORMAT);
    }
}
