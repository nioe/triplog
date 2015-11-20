package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.common.dto.Picture;
import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.core.entity.db.GpsPointDBObject;
import ch.exq.triplog.server.core.entity.db.PictureDBObject;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import org.junit.Before;
import org.junit.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class StepMappingTest {

    private static final String STEP_ID = "123";
    private static final String TRIP_ID = "456";
    private static final String STEP_NAME = "name";
    private static final LocalDate FROM_DATE = LocalDate.of(2015, 6, 1);
    private static final LocalDate TO_DATE = LocalDate.of(2016, 6, 3);
    private static final String LEAD = "lead";
    private static final String COVER_PICTURE = "cover pic";
    private static final String STEP_TEXT = "text";
    private static final LocalDateTime CAPTURE_DATE = LocalDateTime.of(2015, 11, 18, 7, 31, 15);
    private static final LocalDateTime CREATED = LocalDateTime.of(2015, 11, 20, 7, 52, 15);
    private static final LocalDateTime LAST_UPDATED = LocalDateTime.of(2015, 11, 20, 8, 10, 13);
    private static final LocalDateTime PUBLISHED = LocalDateTime.of(2015, 11, 20, 10, 17, 28);
    private static final List<String> TRAVELED_COUNTRIES = Arrays.asList("CH", "DE", "AT");
    private static final List<Picture> PICTURES = Arrays.asList(
            new Picture("pic1", new GpsPoint("0.482", "1.396"), "caption1", CAPTURE_DATE, 123, 456, true),
            new Picture("pic2", new GpsPoint("0.932", "1.849"), "caption2", CAPTURE_DATE, 321, 654, false)
    );
    private static final List<PictureDBObject> PICTURE_DB_OBJECTS = Arrays.asList(
            new PictureDBObject("pic1", new GpsPointDBObject(new BigDecimal("0.482"), new BigDecimal("1.396")), "caption1", CAPTURE_DATE, 123, 456, true),
            new PictureDBObject("pic2", new GpsPointDBObject(new BigDecimal("0.932"), new BigDecimal("1.849")), "caption2", CAPTURE_DATE, 321, 654, false)
    );
    private static final List<GpsPoint> GPS_POINTS = Arrays.asList(new GpsPoint("1.23", "0.456"), new GpsPoint("0.567", "1.89"));
    private static final List<GpsPointDBObject> GPS_POINT_DB_OBJECTS = Arrays.asList(
            new GpsPointDBObject(new BigDecimal("1.23"), new BigDecimal("0.456")),
            new GpsPointDBObject(new BigDecimal("0.567"), new BigDecimal("1.89"))
    );

    private TriplogMapper mapper = new TriplogMapper();

    @Before
    public void setUp() {
        mapper.conf();
    }

    @Test
    public void should_map_step_details_object_to_db_object() throws Exception {
        // given
        StepDetail stepDetail = new StepDetail();
        stepDetail.setStepId(STEP_ID);
        stepDetail.setTripId(TRIP_ID);
        stepDetail.setStepName(STEP_NAME);
        stepDetail.setFromDate(FROM_DATE);
        stepDetail.setToDate(TO_DATE);
        stepDetail.setStepLead(LEAD);
        stepDetail.setCoverPicture(COVER_PICTURE);
        stepDetail.setStepText(STEP_TEXT);
        stepDetail.setPictures(PICTURES);
        stepDetail.setGpsPoints(GPS_POINTS);
        stepDetail.setTraveledCountries(TRAVELED_COUNTRIES);
        stepDetail.setCreated(CREATED);
        stepDetail.setLastUpdated(LAST_UPDATED);
        stepDetail.setPublished(PUBLISHED);

        // when
        StepDBObject actual = mapper.map(stepDetail, StepDBObject.class);

        // then
        assertThat(actual.getStepId()).isEqualTo(STEP_ID);
        assertThat(actual.getTripId()).isEqualTo(TRIP_ID);
        assertThat(actual.getStepName()).isEqualTo(STEP_NAME);
        assertThat(actual.getFromDate()).isEqualTo(FROM_DATE);
        assertThat(actual.getToDate()).isEqualTo(TO_DATE);
        assertThat(actual.getStepLead()).isEqualTo(LEAD);
        assertThat(actual.getCoverPicture()).isEqualTo(COVER_PICTURE);
        assertThat(actual.getStepText()).isEqualTo(STEP_TEXT);
        assertThat(actual.getPictures()).containsAll(PICTURE_DB_OBJECTS);
        assertThat(actual.getGpsPoints()).containsAll(GPS_POINT_DB_OBJECTS);
        assertThat(actual.getTraveledCountries()).containsAll(TRAVELED_COUNTRIES);
        assertThat(actual.getCreated()).isEqualTo(CREATED);
        assertThat(actual.getLastUpdated()).isEqualTo(LAST_UPDATED);
        assertThat(actual.getPublished()).isEqualTo(PUBLISHED);
    }

    @Test
    public void should_map_db_object_to_step_detail() throws Exception {
        // given
        StepDBObject stepDBObject = new StepDBObject();
        stepDBObject.setStepId(STEP_ID);
        stepDBObject.setTripId(TRIP_ID);
        stepDBObject.setStepName(STEP_NAME);
        stepDBObject.setFromDate(FROM_DATE);
        stepDBObject.setToDate(TO_DATE);
        stepDBObject.setStepLead(LEAD);
        stepDBObject.setCoverPicture(COVER_PICTURE);
        stepDBObject.setStepText(STEP_TEXT);
        stepDBObject.setPictures(PICTURE_DB_OBJECTS);
        stepDBObject.setGpsPoints(GPS_POINT_DB_OBJECTS);
        stepDBObject.setTraveledCountries(TRAVELED_COUNTRIES);
        stepDBObject.setCreated(CREATED);
        stepDBObject.setLastUpdated(LAST_UPDATED);
        stepDBObject.setPublished(PUBLISHED);

        // when
        StepDetail actual = mapper.map(stepDBObject, StepDetail.class);

        // then
        assertThat(actual.getStepId()).isEqualTo(STEP_ID);
        assertThat(actual.getTripId()).isEqualTo(TRIP_ID);
        assertThat(actual.getStepName()).isEqualTo(STEP_NAME);
        assertThat(actual.getFromDate()).isEqualTo(FROM_DATE);
        assertThat(actual.getToDate()).isEqualTo(TO_DATE);
        assertThat(actual.getStepLead()).isEqualTo(LEAD);
        assertThat(actual.getCoverPicture()).isEqualTo(COVER_PICTURE);
        assertThat(actual.getStepText()).isEqualTo(STEP_TEXT);
        assertThat(actual.getPictures()).containsAll(PICTURES);
        assertThat(actual.getGpsPoints()).containsAll(GPS_POINTS);
        assertThat(actual.getTraveledCountries()).containsAll(TRAVELED_COUNTRIES);
        assertThat(actual.getCreated()).isEqualTo(CREATED);
        assertThat(actual.getLastUpdated()).isEqualTo(LAST_UPDATED);
        assertThat(actual.getPublished()).isEqualTo(PUBLISHED);
    }

    @Test
    public void should_map_db_object_to_step() throws Exception {
        // given
        StepDBObject stepDBObject = new StepDBObject();
        stepDBObject.setStepId(STEP_ID);
        stepDBObject.setTripId(TRIP_ID);
        stepDBObject.setStepName(STEP_NAME);
        stepDBObject.setFromDate(FROM_DATE);
        stepDBObject.setToDate(TO_DATE);
        stepDBObject.setStepLead(LEAD);
        stepDBObject.setCoverPicture(COVER_PICTURE);
        stepDBObject.setStepText(STEP_TEXT);
        stepDBObject.setPictures(PICTURE_DB_OBJECTS);
        stepDBObject.setGpsPoints(GPS_POINT_DB_OBJECTS);

        // when
        Step actual = mapper.map(stepDBObject, Step.class);

        // then
        assertThat(actual.getStepId()).isEqualTo(STEP_ID);
        assertThat(actual.getTripId()).isEqualTo(TRIP_ID);
        assertThat(actual.getStepName()).isEqualTo(STEP_NAME);
        assertThat(actual.getFromDate()).isEqualTo(FROM_DATE);
        assertThat(actual.getToDate()).isEqualTo(TO_DATE);
        assertThat(actual.getStepLead()).isEqualTo(LEAD);
        assertThat(actual.getCoverPicture()).isEqualTo(COVER_PICTURE);
    }
}
