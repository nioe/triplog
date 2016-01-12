package ch.exq.triplog.server.core.boundary.json.serializer;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;
import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static com.fasterxml.jackson.databind.type.TypeFactory.defaultInstance;
import static org.assertj.core.api.Assertions.assertThat;

public class TriplogModuleTest {

    private static final LocalDate DATE = LocalDate.of(1988, 1, 13);
    private static final LocalDateTime DATE_TIME = LocalDateTime.of(1988, 1, 13, 9, 38, 12);
    private static final String NORMAL_DATE_JSON = "{\"date\":\"1988-01-13\"}";
    private static final String NORMAL_DATE_TIME_JSON = "{\"dateTime\":\"1988-01-13T09:38:12\"}";

    private ObjectMapper mapper = new ObjectMapper();

    @Before
    public void setUp() {
        mapper.registerModule(new TriplogModule());
        mapper.setSerializationInclusion(NON_NULL);
    }

    @Test
    public void should_serialize_local_date() throws Exception {
        // given
        TestDto testDto = new TestDto(DATE);

        // when
        String actual = mapper.writeValueAsString(testDto);

        // then
        assertThat(actual).isEqualTo(NORMAL_DATE_JSON);
    }

    @Test
    public void should_serialize_local_date_time() throws Exception {
        // given
        TestDto testDto = new TestDto(DATE_TIME);

        // when
        String actual = mapper.writeValueAsString(testDto);

        // then
        assertThat(actual).isEqualTo(NORMAL_DATE_TIME_JSON);
    }

    @Test
    public void should_deserialize_local_date_in_normal_format() throws Exception {
        // when
        TestDto actual = mapper.readValue(NORMAL_DATE_JSON.getBytes(), defaultInstance().constructType(TestDto.class));

        // then
        assertThat(actual.getDate()).isEqualTo(DATE);
    }

    @Test
    public void should_deserialize_local_date_in_js_json_format() throws Exception {
        // given
        String jsonString = "{\"date\":\"1988-01-13T00:00:00.000Z\"}";

        // when
        TestDto actual = mapper.readValue(jsonString.getBytes(), defaultInstance().constructType(TestDto.class));

        // then
        assertThat(actual.getDate()).isEqualTo(DATE);
    }

    @Test
    public void should_deserialize_local_date_time_in_normal_format() throws Exception {
        // when
        TestDto actual = mapper.readValue(NORMAL_DATE_TIME_JSON.getBytes(), defaultInstance().constructType(TestDto.class));

        // then
        assertThat(actual.getDateTime()).isEqualToIgnoringNanos(DATE_TIME);
    }

    @Test
    public void should_deserialize_local_date_time_in_js_json_format() throws Exception {
        // given
        String jsonString = "{\"dateTime\":\"1988-01-13T09:38:12.123Z\"}";

        // when
        TestDto actual = mapper.readValue(jsonString.getBytes(), defaultInstance().constructType(TestDto.class));

        // then
        assertThat(actual.getDateTime()).isEqualToIgnoringNanos(DATE_TIME);
    }

    @JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, isGetterVisibility = NONE, setterVisibility = NONE)
    private static class TestDto {
        private LocalDate date;
        private LocalDateTime dateTime;

        public TestDto() {
        }

        public TestDto(LocalDate date) {
            this.date = date;
        }

        public TestDto(LocalDateTime dateTime) {
            this.dateTime = dateTime;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public LocalDateTime getDateTime() {
            return dateTime;
        }

        public void setDateTime(LocalDateTime dateTime) {
            this.dateTime = dateTime;
        }
    }
}