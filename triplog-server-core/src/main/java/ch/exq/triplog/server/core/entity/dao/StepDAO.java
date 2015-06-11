package ch.exq.triplog.server.core.entity.dao;

import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.entity.db.TriplogDB;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.WriteResult;
import org.slf4j.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
@Stateless
public class StepDAO {

    @Inject
    Logger logger;

    @Inject
    TriplogDB db;

    @Inject
    TriplogMapper mapper;


    public List<StepDBObject> getAllStepsOfTrip(String tripId) {
        ArrayList<StepDBObject> steps = new ArrayList<>();
        DBCursor cursor = db.getStepCollection().find(new BasicDBObject(StepDBObject.TRIP_ID, tripId));
        while (cursor.hasNext()) {
            steps.add(StepDBObject.from(cursor.next()));
        }

        return steps;
    }

    public StepDBObject getStep(String stepId) {
        DBCursor cursor = db.getStepCollection().find(idDBObject(stepId));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one step with id {} found!", stepId);
        }

        return StepDBObject.from(cursor.next());
    }

    public WriteResult createStep(StepDBObject step) {
        return db.getStepCollection().insert(step);
    }

    public WriteResult deleteStep(StepDBObject step) {
        return db.getStepCollection().remove(step);
    }

    public WriteResult updateStep(String stepId, StepDBObject step) {
        return db.getStepCollection().update(idDBObject(stepId), step);
    }

    public WriteResult deleteAllStepsOfTrip(String tripId) {
        return db.getStepCollection().remove(new BasicDBObject(StepDBObject.TRIP_ID, tripId));
    }


    private BasicDBObject idDBObject(String stepId) {
        return new BasicDBObject(StepDBObject.STEP_ID, stepId);
    }
}
