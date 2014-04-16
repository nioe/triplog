package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.service.dto.Leg;
import ch.exq.triplog.server.service.dto.Trip;
import ch.exq.triplog.server.entity.db.LegDBObject;
import ch.exq.triplog.server.entity.db.TriplogDB;
import ch.exq.triplog.server.entity.mapper.TriplogMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
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
    TripDAO tripDAO;

    @Inject
    TriplogDB db;

    @Inject
    TriplogMapper mapper;


    public List<Leg> getAllLegsOfTrip(String tripId) {
        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null) {
            return null;
        }

        ArrayList<Leg> legs = new ArrayList<>();
        DBCursor cursor = db.getLegCollection().find(new BasicDBObject(LegDBObject.TRIP_ID, tripId));
        while (cursor.hasNext()) {
            legs.add(mapper.map(LegDBObject.from(cursor.next()), Leg.class));
        }

        return legs;
    }

    public Leg getLeg(String tripId, String legId) {
        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null || !trip.getLegs().contains(legId)) {
            return null;
        }

        DBCursor cursor = db.getLegCollection().find(new BasicDBObject(LegDBObject.LEG_ID, new ObjectId(legId)));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one leg with id {} found!", legId);
        }

        return mapper.map(LegDBObject.from(cursor.next()), Leg.class);
    }

    public Leg createLeg(Leg leg) {
        LegDBObject legDBObject = mapper.map(leg, LegDBObject.class);
        db.getLegCollection().insert(legDBObject);

        tripDAO.addLeg(legDBObject.getTripId(), legDBObject.getLegId());

        return mapper.map(legDBObject, Leg.class);
    }
}
