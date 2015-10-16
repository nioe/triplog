package ch.exq.triplog.server.core.entity.db;

import com.mongodb.DBObject;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.time.LocalDate;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDate;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:43
 */
public class TripDBObject extends AbstractDBObject<TripDBObject> {

    @Inject
    Logger logger;

    public static final String COLLECTION_NAME = "trip";
    public static final String TRIP_ID = "tripId";
    public static final String TRIP_NAME = "tripName";
    public static final String TRIP_DATE = "tripDate";
    public static final String TRIP_LEAD = "tripLead";
    public static final String TRIP_TEXT = "tripText";
    public static final String COVER_PICTURE = "coverPicture";


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

    @Override
    protected Logger logger() {
        return logger;
    }
}
