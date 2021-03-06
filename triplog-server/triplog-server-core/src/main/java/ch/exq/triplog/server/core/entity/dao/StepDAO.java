package ch.exq.triplog.server.core.entity.dao;

import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.entity.db.TriplogDB;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.WriteResult;
import org.slf4j.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

import static java.time.LocalDateTime.now;

@Stateless
public class StepDAO {

    private Logger logger;
    private TriplogDB db;

    public StepDAO() {}

    @Inject
    public StepDAO(Logger logger, TriplogDB db) {
        this.logger = logger;
        this.db = db;
    }

    public List<StepDBObject> getAllSteps() {
        ArrayList<StepDBObject> steps = new ArrayList<>();
        DBCursor cursor = db.getStepCollection().find();
        while (cursor.hasNext()) {
            steps.add(StepDBObject.from(cursor.next()));
        }

        return steps;
    }

    public List<StepDBObject> getAllStepsOfTrip(String tripId) {
        ArrayList<StepDBObject> steps = new ArrayList<>();
        DBCursor cursor = db.getStepCollection().find(new BasicDBObject(StepDBObject.TRIP_ID, tripId));
        while (cursor.hasNext()) {
            steps.add(StepDBObject.from(cursor.next()));
        }

        return steps;
    }

    public StepDBObject getStep(String tripId, String stepId) {
        DBCursor cursor = db.getStepCollection().find(idDBObject(tripId, stepId));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one step with id {} found!", stepId);
        }

        return StepDBObject.from(cursor.next());
    }

    public WriteResult createStep(StepDBObject step) {
        step.setCreated(now());
        return db.getStepCollection().insert(step);
    }

    public WriteResult deleteStep(StepDBObject step) {
        return db.getStepCollection().remove(step);
    }

    public WriteResult updateStep(String tripId, String stepId, StepDBObject step) {
        step.setLastUpdated(now());
        return db.getStepCollection().update(idDBObject(tripId, stepId), step);
    }

    public WriteResult deleteAllStepsOfTrip(String tripId) {
        return db.getStepCollection().remove(new BasicDBObject(StepDBObject.TRIP_ID, tripId));
    }


    private BasicDBObject idDBObject(String tripId, String stepId) {
        return new BasicDBObject(StepDBObject.TRIP_ID, tripId).append(StepDBObject.STEP_ID, stepId);
    }
}
