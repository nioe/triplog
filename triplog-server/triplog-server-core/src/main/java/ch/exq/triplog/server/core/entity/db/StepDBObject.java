package ch.exq.triplog.server.core.entity.db;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;
import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static ch.exq.triplog.server.util.date.DateConverter.*;

public class StepDBObject extends AbstractDBObject<StepDBObject> implements MetaDataProvider {

    private Logger logger;

    public static final String COLLECTION_NAME = "step";
    public static final String STEP_ID = "stepId";
    public static final String TRIP_ID = "tripId";
    public static final String STEP_NAME = "stepName";
    public static final String FROM_DATE = "fromDate";
    public static final String TO_DATE = "toDate";
    public static final String STEP_LEAD = "stepLead";
    public static final String COVER_PICTURE = "coverPicture";

    public static final String STEP_TEXT = "stepText";
    public static final String GPS_POINTS = "gpsPoints";
    public static final String PICTURES = "pictures";
    public static final String TRAVELED_COUNTRIES = "traveledCountries";

    public static final String CREATED = "created";
    public static final String LAST_UPDATED = "lastUpdated";
    public static final String PUBLISHED = "published";

    public StepDBObject() {
        this.logger = LoggerFactory.getLogger(StepDBObject.class);
    }

    public static StepDBObject from(DBObject dbObject) {
        StepDBObject stepDBObject = new StepDBObject();
        stepDBObject.putAll(dbObject.toMap());

        return stepDBObject;
    }

    public String getStepId() {
        return getString(STEP_ID);
    }

    public void setStepId(String stepId) {
        put(STEP_ID, stepId);
    }

    public String getTripId() {
        return getString(TRIP_ID);
    }

    public void setTripId(String tripId) {
        put(TRIP_ID, tripId);
    }

    public String getStepName() {
        return getString(STEP_NAME);
    }

    public void setStepName(String stepName) {
        put(STEP_NAME, stepName);
    }

    public String getStepLead() {
        return getString(STEP_LEAD);
    }

    public void setStepLead(String stepLead) {
        put(STEP_LEAD, stepLead);
    }

    public String getCoverPicture() {
        return getString(COVER_PICTURE);
    }

    public void setCoverPicture(String coverPicture) {
        put(COVER_PICTURE, coverPicture);
    }

    public String getStepText() {
        return getString(STEP_TEXT);
    }

    public void setStepText(String stepText) {
        put(STEP_TEXT, stepText);
    }

    public List<PictureDBObject> getPictures() {
        List<PictureDBObject> pictures = new ArrayList<>();

        Object picturesObject = get(PICTURES);
        if (picturesObject != null) {
            ((BasicDBList) picturesObject).forEach(dbObject -> pictures.add(new PictureDBObject((BasicDBObject) dbObject)));
        }

        return pictures;
    }

    public void setPictures(List<PictureDBObject> pictures) {
        BasicDBList basicDBList = new BasicDBList();
        if (pictures != null) {
            pictures.stream().forEach(basicDBList::add);
        }

        put(PICTURES, basicDBList);
    }


    public List<GpsPointDBObject> getGpsPoints() {
        List<GpsPointDBObject> gpsPoints = new ArrayList<>();

        Object gpsPointObject = get(GPS_POINTS);
        if (gpsPointObject != null) {
            ((BasicDBList) gpsPointObject).forEach(dbObject -> gpsPoints.add(new GpsPointDBObject((BasicDBObject) dbObject)));
        }

        return gpsPoints;
    }

    public void setGpsPoints(List<GpsPointDBObject> gpsPoints) {
        BasicDBList basicDBList = new BasicDBList();
        if (gpsPoints != null) {
            gpsPoints.stream().forEach(basicDBList::add);
        }

        put(GPS_POINTS, basicDBList);
    }

    public List<String> getTraveledCountries() {
        List<String> traveledCountries = new ArrayList<>();

        Object traveledCountriesObject = get(TRAVELED_COUNTRIES);
        if (traveledCountriesObject != null) {
            ((BasicDBList) traveledCountriesObject).forEach(country -> traveledCountries.add((String) country));
        }

        return traveledCountries;
    }

    public void setTraveledCountries(List<String> traveledCountries) {
        BasicDBList basicDBList = new BasicDBList();
        if (traveledCountries != null) {
            traveledCountries.stream().forEach(basicDBList::add);
        }

        put(TRAVELED_COUNTRIES, basicDBList);
    }

    public LocalDate getFromDate() {
        String fromDate = getString(FROM_DATE);
        if (fromDate == null) {
            return null;
        }

        return convertToDate(fromDate);
    }

    public void setFromDate(LocalDate fromDate) {
        if (fromDate != null) {
            put(FROM_DATE, convertToString(fromDate));
        }
    }


    public LocalDate getToDate() {
        String toDate = getString(TO_DATE);
        if (toDate == null) {
            return null;
        }

        return convertToDate(toDate);
    }

    public void setToDate(LocalDate toDate) {
        if (toDate != null) {
            put(TO_DATE, convertToString(toDate));
        }
    }

    public LocalDateTime getCreated() {
        return convertToDateTime(getString(CREATED));
    }

    public void setCreated(LocalDateTime created) {
        put(CREATED, convertToString(created));
    }

    public LocalDateTime getLastUpdated() {
        return convertToDateTime(getString(LAST_UPDATED));
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        put(LAST_UPDATED, convertToString(lastUpdated));
    }

    public LocalDateTime getPublished() {
        return convertToDateTime(getString(PUBLISHED));
    }

    public void setPublished(LocalDateTime published) {
        put(PUBLISHED, convertToString(published));
    }

    protected Logger logger() {
        return logger;
    }
}
