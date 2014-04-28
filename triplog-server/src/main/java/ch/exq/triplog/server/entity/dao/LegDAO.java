package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.db.LegDBObject;
import ch.exq.triplog.server.entity.db.TriplogDB;
import ch.exq.triplog.server.util.mapper.TriplogMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.WriteResult;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
public class LegDAO {
    private static final Logger logger = LoggerFactory.getLogger(LegDAO.class);

    @Inject
    TriplogDB db;

    @Inject
    TriplogMapper mapper;


    public List<LegDBObject> getAllLegsOfTrip(String tripId) {
        ArrayList<LegDBObject> legs = new ArrayList<>();
        DBCursor cursor = db.getLegCollection().find(new BasicDBObject(LegDBObject.TRIP_ID, tripId));
        while (cursor.hasNext()) {
            legs.add(LegDBObject.from(cursor.next()));
        }

        return legs;
    }

    public LegDBObject getLeg(String legId) {
        DBCursor cursor = db.getLegCollection().find(new BasicDBObject(LegDBObject.LEG_ID, new ObjectId(legId)));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one leg with id {} found!", legId);
        }

        return LegDBObject.from(cursor.next());
    }

    public WriteResult createLeg(LegDBObject leg) {
        return db.getLegCollection().insert(leg);
    }

    public WriteResult deleteLeg(LegDBObject leg) {
        return db.getLegCollection().remove(leg);
    }

    public WriteResult deleteAllLegsOfTrip(String tripId) {
        return db.getLegCollection().remove(new BasicDBObject(LegDBObject.TRIP_ID, tripId));
    }
}
