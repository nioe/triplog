package ch.exq.triplog.server.util.json;

import org.junit.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

public class JsonDateAdapterTest {
    private static final String DATE_STRING_OWN_FORMAT = "2014-08-25";
    private static final String DATE_STRING_JS_ISO_STRING = "2014-08-25T15:56:13.303Z";
    private static final LocalDate DATE = LocalDate.of(2014, 8, 25);

    private JsonDateAdapter adapter = new JsonDateAdapter();

    @Test
    public void should_unmarshal_date_string_with_own_format() throws Exception {
        LocalDate actual = adapter.unmarshal(DATE_STRING_OWN_FORMAT);
        assertThat(actual).isEqualTo(DATE);
    }

    @Test
    public void should_unmarshal_date_string_with_js_iso_format() throws Exception {
        LocalDate actual = adapter.unmarshal(DATE_STRING_JS_ISO_STRING);
        assertThat(actual).isEqualTo(DATE);
    }

    @Test
    public void marshal() throws Exception {
        String actual = adapter.marshal(DATE);
        assertThat(actual).isEqualTo(DATE_STRING_OWN_FORMAT);
    }
}