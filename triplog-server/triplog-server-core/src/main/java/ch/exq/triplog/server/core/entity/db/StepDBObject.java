package ch.exq.triplog.server.core.entity.db;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDate;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 13:23
 */
public class StepDBObject extends AbstractDBObject<StepDBObject> {

    @Inject
    Logger logger;

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

    public List<String> getPictures() {
        List<String> images = new ArrayList<>();

        Object imagesObject = get(PICTURES);
        if (imagesObject != null) {
            ListIterator<Object> imagesList = ((BasicDBList) imagesObject).listIterator();
            while (imagesList.hasNext()) {
                images.add((String) imagesList.next());
            }
        }

        return images;
    }

    public void setPictures(List<String> pictures) {
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

    protected Logger logger() {
        return logger;
    }
}
