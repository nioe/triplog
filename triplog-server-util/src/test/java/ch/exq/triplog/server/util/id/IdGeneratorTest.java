package ch.exq.triplog.server.util.id;

import org.junit.Test;

import java.time.LocalDate;

import static ch.exq.triplog.server.util.id.IdGenerator.generateIdWithFullDate;
import static ch.exq.triplog.server.util.id.IdGenerator.generateIdWithYear;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 15:55
 */
public class IdGeneratorTest {

    @Test
    public void should_generate_id_from_name_and_year() throws Exception {
        // given
        String name = "Awesome Trip";
        LocalDate date = LocalDate.of(2015, 05, 30);

        // when
        String actual = generateIdWithYear(name, date);

        // then
        assertThat(actual).isEqualTo("awesome-trip-2015");
    }

    @Test
    public void should_generate_id_from_name_and_full_date() throws Exception {
        // given
        String name = "Awesome Trip";
        LocalDate date = LocalDate.of(2015, 05, 30);

        // when
        String actual = generateIdWithFullDate(name, date);

        // then
        assertThat(actual).isEqualTo("awesome-trip-2015-05-30");
    }
}