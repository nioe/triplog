package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
import org.junit.Before;
import org.junit.Test;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 15.04.14
 * Time: 16:06
 */
public class TripToDBObjectMapTest {

    private ModelMapper mapper;

    @Before
    public void setUp() {
        mapper = new ModelMapper();
        //mapper.addMappings(new TripToDBObjectMap());
    }

    @Test
    public void should_map_trip_id() {
        String tripId = "trip_id";
        Trip trip = new Trip();
        trip.setTripId(tripId);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isEqualTo(tripId);
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isNull();
        assertThat(actual.getCoverPicture()).isNull();
    }

    @Test
    public void should_map_trip_name() {
        String tripName = "trip_name";
        Trip trip = new Trip();
        trip.setTripName(tripName);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isEqualTo(tripName);
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isNull();
        assertThat(actual.getCoverPicture()).isNull();
    }

    @Test
    public void should_map_trip_date() {
        LocalDate tripDate = LocalDate.now();
        Trip trip = new Trip();
        trip.setTripDate(tripDate);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isEqualTo(tripDate);
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isNull();
        assertThat(actual.getCoverPicture()).isNull();
    }

    @Test
    public void should_map_trip_lead() {
        String tripLead = "trip_lead";
        Trip trip = new Trip();
        trip.setTripLead(tripLead);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isEqualTo(tripLead);
        assertThat(actual.getTripText()).isNull();
        assertThat(actual.getCoverPicture()).isNull();
    }

    @Test
    public void should_map_trip_text() {
        String tripText = "trip_text";
        Trip trip = new Trip();
        trip.setTripText(tripText);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isEqualTo(tripText);
        assertThat(actual.getCoverPicture()).isNull();
    }

    @Test
    public void should_map_cover_picture() {
        String coverPicture = "/url/to/coverPicture.jpg";
        Trip trip = new Trip();
        trip.setCoverPicture(coverPicture);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isNull();
        assertThat(actual.getCoverPicture()).isEqualTo(coverPicture);
    }

    @Test
    public void should_map_steps() {
        Trip trip = new Trip();
        ArrayList<Step> steps = new ArrayList<>();
        steps.add(createStep("123"));
        steps.add(createStep("456"));
        trip.setSteps(steps);

        TripDBObject actual = mapper.map(trip, TripDBObject.class);

        assertThat(actual.getTripId()).isNull();
        assertThat(actual.getTripName()).isNull();
        assertThat(actual.getTripDate()).isNull();
        assertThat(actual.getTripLead()).isNull();
        assertThat(actual.getTripText()).isNull();
    }

    private Step createStep(String stepId) {
        return new Step(stepId, null, null, null, null, null, null);
    }
}
