package ch.exq.triplog.server.entity.db;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:43
 */
public class TripDBObject extends AbstractDBObject {

    private static final Logger logger = LoggerFactory.getLogger(TripDBObject.class);

    public static final String COLLECTION_NAME = "trip";
    public static final String TRIP_ID = "_id";
    public static final String TRIP_NAME = "tripName";
    public static final String TRIP_DESCRIPTION = "tripDescription";
    public static final String LEGS = "legs";


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

    public String getTripDescription() {
        return getString(TRIP_DESCRIPTION);
    }

    public void setTripDescription(String tripDescription) {
        put(TRIP_DESCRIPTION, tripDescription);
    }

    public BasicDBList getLegList() {
        Object legsObject = get(LEGS);
        return legsObject != null ? (BasicDBList) legsObject : null;
    }

    public void setLegList(BasicDBList legList) {
        put(LEGS, legList);
    }

    public List<String> getLegs() {
        List<String> legs = new ArrayList<>();

        BasicDBList legList = getLegList();
        if (legList != null) {
            legList.stream().forEach(legId -> legs.add((String) legId));
        }

        return legs;
    }

    public void setLegs(List<String> legs) {
        BasicDBList basicDBList = new BasicDBList();

        if (legs != null) {
            legs.forEach(legId -> basicDBList.add(legId));
        }

        put(LEGS, basicDBList);
    }

    @Override
    protected Logger logger() {
        return logger;
    }
}
