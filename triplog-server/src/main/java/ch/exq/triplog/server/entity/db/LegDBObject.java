package ch.exq.triplog.server.entity.db;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 13:23
 */
public class LegDBObject extends AbstractDBObject<LegDBObject> {

    private static final Logger logger = LoggerFactory.getLogger(LegDBObject.class);

    public static final String COLLECTION_NAME = "leg";
    public static final String LEG_ID = "_id";
    public static final String TRIP_ID = "tripId";
    public static final String LEG_NAME = "legName";
    public static final String LEG_TEXT = "legText";
    public static final String MAP_URL = "mapUrl";
    public static final String IMAGES = "images";


    public static LegDBObject from(DBObject dbObject) {
        LegDBObject legDBObject = new LegDBObject();
        legDBObject.putAll(dbObject.toMap());

        return legDBObject;
    }

    public String getLegId() {
        return getString(LEG_ID);
    }

    public void setLegId(String legId) {
        put(LEG_ID, legId);
    }

    public String getTripId() {
        return getString(TRIP_ID);
    }

    public void setTripId(String tripId) {
        put(TRIP_ID, tripId);
    }

    public String getLegName() {
        return getString(LEG_NAME);
    }

    public void setLegName(String legName) {
        put(LEG_NAME, legName);
    }

    public String getLegText() {
        return getString(LEG_TEXT);
    }

    public void setLegText(String legText) {
        put(LEG_TEXT, legText);
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
            for (String image : images) {
                basicDBList.add(image);
            }
        }

        put(IMAGES, basicDBList);
    }

    protected Logger logger() {
        return logger;
    }
}
