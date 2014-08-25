package ch.exq.triplog.server.core.entity.db;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 13:23
 */
public class StepDBObject extends AbstractDBObject<StepDBObject> {

    @Inject
    Logger logger;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static final String COLLECTION_NAME = "step";
    public static final String STEP_ID = "_id";
    public static final String TRIP_ID = "tripId";
    public static final String STEP_NAME = "stepName";
    public static final String STEP_TEXT = "stepText";
    public static final String MAP_URL = "mapUrl";
    public static final String IMAGES = "images";
    public static final String FROM_DATE = "fromDate";
    public static final String TO_DATE = "toDate";


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

    public String getStepText() {
        return getString(STEP_TEXT);
    }

    public void setStepText(String stepText) {
        put(STEP_TEXT, stepText);
    }

    public String getMapUrl() {
        return getString(MAP_URL);
    }

    public void setMapUrl(String mapUrl) {
        put(MAP_URL, mapUrl);
    }

    public List<String> getImages() {
        List<String> images = new ArrayList<>();

        Object imagesObject = get(IMAGES);
        if (imagesObject != null) {
            ListIterator<Object> imagesList = ((BasicDBList) imagesObject).listIterator();
            while (imagesList.hasNext()) {
                images.add((String) imagesList.next());
            }
        }

        return images;
    }

    public void setImages(List<String> images) {
        BasicDBList basicDBList = new BasicDBList();
        if (images != null) {
            images.stream().forEach(image -> basicDBList.add(image));
        }

        put(IMAGES, basicDBList);
    }

    public LocalDate getFromDate() {
        return LocalDate.parse(getString(FROM_DATE), FORMATTER);
    }

    public void setFromDate(LocalDate fromDate) {
        put(FROM_DATE, fromDate.format(FORMATTER));
    }


    public LocalDate getToDate() {
        return LocalDate.parse(getString(FROM_DATE), FORMATTER);
    }

    public void setToDate(LocalDate fromDate) {
        put(FROM_DATE, fromDate.format(FORMATTER));
    }

    protected Logger logger() {
        return logger;
    }
}
