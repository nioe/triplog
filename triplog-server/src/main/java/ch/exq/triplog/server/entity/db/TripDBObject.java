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
public class TripDBObject extends AbstractDBObject<TripDBObject> {

    private static final Logger logger = LoggerFactory.getLogger(TripDBObject.class);

    public static final String COLLECTION_NAME = "trip";
    public static final String TRIP_ID = "_id";
    public static final String TRIP_NAME = "tripName";
    public static final String TRIP_DESCRIPTION = "tripDescription";
    public static final String STEPS = "steps";


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

    public BasicDBList getStepList() {
        Object stepsObject = get(STEPS);
        return stepsObject != null ? (BasicDBList) stepsObject : null;
    }

    public void setStepList(BasicDBList stepList) {
        put(STEPS, stepList);
    }

    public List<String> getSteps() {
        List<String> steps = new ArrayList<>();

        BasicDBList stepList = getStepList();
        if (stepList != null) {
            stepList.stream().forEach(stepId -> steps.add((String) stepId));
        }

        return steps;
    }

    public void setStpes(List<String> steps) {
        BasicDBList basicDBList = new BasicDBList();

        if (steps != null) {
            steps.forEach(stepId -> basicDBList.add(stepId));
        }

        put(STEPS, basicDBList);
    }

    @Override
    protected Logger logger() {
        return logger;
    }
}
