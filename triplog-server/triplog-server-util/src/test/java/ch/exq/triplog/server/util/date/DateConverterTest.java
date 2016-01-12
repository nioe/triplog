package ch.exq.triplog.server.util.date;

import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDate;
import static ch.exq.triplog.server.util.date.DateConverter.convertToDateTime;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;
import static org.assertj.core.api.Assertions.assertThat;

public class DateConverterTest {

    @Test
    public void should_convert_LocalDate_to_String() {
        // given
        LocalDate date = LocalDate.of(2015, 11, 18);

        // when
        String actual = convertToString(date);

        // then
        assertThat(actual).isEqualTo("2015-11-18");
    }

    @Test
    public void should_convert_string_to_LocalDate() {
        // given
        String dateString = "2015-11-18";

        // when
        LocalDate actual = convertToDate(dateString);

        // then
        assertThat(actual).isEqualTo(LocalDate.of(2015, 11, 18));
    }

    @Test
    public void should_convert_JS_date_string_to_LocalDate() {
        // given
        String dateString = "2015-11-18T00:00:00.000Z";

        // when
        LocalDate actual = convertToDate(dateString);

        // then
        assertThat(actual).isEqualTo(LocalDate.of(2015, 11, 18));
    }

    @Test
    public void should_convert_LocalDateTime_to_String() {
        // given
        LocalDateTime date = LocalDateTime.of(2015, 11, 18, 7, 42, 47);

        // when
        String actual = convertToString(date);

        // then
        assertThat(actual).isEqualTo("2015-11-18T07:42:47");
    }

    @Test
    public void should_convert_String_to_LocalDateTime() {
        // given
        String dateString = "2015-11-18T07:42:47";

        // when
        LocalDateTime actual = convertToDateTime(dateString);

        // then
        assertThat(actual).isEqualTo(LocalDateTime.of(2015, 11, 18, 7, 42, 47));
    }

    @Test
    public void should_convert_JS_date_string_to_LocalDateTime() {
        // given
        String dateString = "2015-11-18T07:42:47.123Z";

        // when
        LocalDateTime actual = convertToDateTime(dateString);

        // then
        assertThat(actual).isEqualToIgnoringNanos(LocalDateTime.of(2015, 11, 18, 7, 42, 47));
    }
}