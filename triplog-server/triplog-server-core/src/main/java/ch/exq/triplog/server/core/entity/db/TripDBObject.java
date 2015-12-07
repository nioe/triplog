package ch.exq.triplog.server.core.entity.db;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;
import com.mongodb.DBObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static ch.exq.triplog.server.util.date.DateConverter.*;

public class TripDBObject extends AbstractDBObject<TripDBObject> implements MetaDataProvider {

    private Logger logger;

    public static final String COLLECTION_NAME = "trip";
    public static final String TRIP_ID = "tripId";
    public static final String TRIP_NAME = "tripName";
    public static final String TRIP_DATE = "tripDate";
    public static final String TRIP_LEAD = "tripLead";
    public static final String TRIP_TEXT = "tripText";
    public static final String COVER_PICTURE = "coverPicture";
    public static final String CREATED = "created";
    public static final String LAST_UPDATED = "lastUpdated";
    public static final String PUBLISHED = "published";

    public TripDBObject() {
        this.logger = LoggerFactory.getLogger(TripDBObject.class);
    }

    public static TripDBObject from(DBObject dbObject) {
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.putAll(dbObject.toMap());

        return tripDBObject;
    }


    public String getTripId() {
        return getString(TRIP_ID);
    }

    public void setTripId(String tripId) {
        put(TRIP_ID, tripId);
    }

    public String getTripName() {
        return getString(TRIP_NAME);
    }

    public void setTripName(String tripName) {
        put(TRIP_NAME, tripName);
    }

    public LocalDate getTripDate() {
        return convertToDate(getString(TRIP_DATE));
    }

    public void setTripDate(LocalDate tripDate) {
        put(TRIP_DATE, convertToString(tripDate));
    }

    public String getTripLead() {
        return getString(TRIP_LEAD);
    }

    public void setTripLead(String tripLead) {
        put(TRIP_LEAD, tripLead);
    }

    public String getTripText() {
        return getString(TRIP_TEXT);
    }

    public void setTripText(String tripDescription) {
        put(TRIP_TEXT, tripDescription);
    }

    public String getCoverPicture() {
        return getString(COVER_PICTURE);
    }

    public void setCoverPicture(String coverPicture) {
        put(COVER_PICTURE, coverPicture);
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

    @Override
    protected Logger logger() {
        return logger;
    }
}
