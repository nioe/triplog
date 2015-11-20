package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 20.11.15
 * Time: 17:53
 */
public class TripMappingTest {

    private static final String TRIP_ID = "tripId";
    private static final LocalDate TRIP_DATE = LocalDate.of(2015, 11, 20);
    private static final String TRIP_LEAD = "tripLead";
    private static final String TRIP_TEXT = "tripText";
    private static final String COVER_PICTURE = "coverPicture";
    private static final LocalDateTime CREATED = LocalDateTime.of(2015, 11, 20, 7, 52, 15);
    private static final LocalDateTime LAST_UPDATED = LocalDateTime.of(2015, 11, 20, 8, 10, 13);
    private static final LocalDateTime PUBLISHED = LocalDateTime.of(2015, 11, 20, 10, 17, 28);

    private TriplogMapper mapper = new TriplogMapper();

    @Before
    public void setUp() {
        mapper.conf();
    }

    @Test
    public void should_map_trip_object_to_db_object() throws Exception {
        // given
        Trip trip = new Trip();
        trip.setTripId(TRIP_ID);
        trip.setTripDate(TRIP_DATE);
        trip.setTripLead(TRIP_LEAD);
        trip.setTripText(TRIP_TEXT);
        trip.setCoverPicture(COVER_PICTURE);
        trip.setCreated(CREATED);
        trip.setLastUpdated(LAST_UPDATED);
        trip.setPublished(PUBLISHED);

        // when
        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        // then
        assertThat(actual.getTripId()).isEqualTo(TRIP_ID);
        assertThat(actual.getTripDate()).isEqualTo(TRIP_DATE);
        assertThat(actual.getTripLead()).isEqualTo(TRIP_LEAD);
        assertThat(actual.getTripText()).isEqualTo(TRIP_TEXT);
        assertThat(actual.getCoverPicture()).isEqualTo(COVER_PICTURE);
        assertThat(actual.getCreated()).isEqualTo(CREATED);
        assertThat(actual.getLastUpdated()).isEqualTo(LAST_UPDATED);
        assertThat(actual.getPublished()).isEqualTo(PUBLISHED);
    }

    @Test
    public void should_map_db_object_to_trip_object() throws Exception {
        // given
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setTripId(TRIP_ID);
        tripDBObject.setTripDate(TRIP_DATE);
        tripDBObject.setTripLead(TRIP_LEAD);
        tripDBObject.setTripText(TRIP_TEXT);
        tripDBObject.setCoverPicture(COVER_PICTURE);
        tripDBObject.setCreated(CREATED);
        tripDBObject.setLastUpdated(LAST_UPDATED);
        tripDBObject.setPublished(PUBLISHED);

        // when
        Trip actual = mapper.map(tripDBObject, Trip.class);

        // then
        assertThat(actual.getTripId()).isEqualTo(TRIP_ID);
        assertThat(actual.getTripDate()).isEqualTo(TRIP_DATE);
        assertThat(actual.getTripLead()).isEqualTo(TRIP_LEAD);
        assertThat(actual.getTripText()).isEqualTo(TRIP_TEXT);
        assertThat(actual.getCoverPicture()).isEqualTo(COVER_PICTURE);
        assertThat(actual.getCreated()).isEqualTo(CREATED);
        assertThat(actual.getLastUpdated()).isEqualTo(LAST_UPDATED);
        assertThat(actual.getPublished()).isEqualTo(PUBLISHED);
    }
}
