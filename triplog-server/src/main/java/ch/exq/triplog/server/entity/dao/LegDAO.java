package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.db.LegDBObject;
import ch.exq.triplog.server.entity.db.TriplogDB;
import ch.exq.triplog.server.entity.dto.Leg;
import ch.exq.triplog.server.entity.dto.Trip;
import ch.exq.triplog.server.entity.exceptions.CreationException;
import ch.exq.triplog.server.control.mapper.TriplogMapper;
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
        LegDBObject legDBObject = getLegDBObject(tripId, legId);
        return legDBObject != null ? mapper.map(legDBObject, Leg.class) : null;
    }

    public Leg createLeg(Leg leg) throws CreationException {
        if (leg.getTripId() == null || tripDAO.getTripById(leg.getTripId()) == null) {
            throw new CreationException("Could not find trip with id " + leg.getTripId());
        }

        if (leg == null || leg.getLegName() == null || leg.getLegName().isEmpty()) {
            throw new CreationException("Leg incomplete: legName must be set");
        }

        LegDBObject legDBObject = mapper.map(leg, LegDBObject.class);
        db.getLegCollection().insert(legDBObject);

        tripDAO.addLegToTrip(legDBObject.getTripId(), legDBObject.getLegId());

        return mapper.map(legDBObject, Leg.class);
    }

    public boolean deleteLeg(String tripId, String legId) {
        LegDBObject legDBObject = getLegDBObject(tripId, legId);

        if (legDBObject == null) {
            return false;
        }

        tripDAO.removeLegFromTrip(tripId, legId);

        WriteResult result = db.getLegCollection().remove(legDBObject);
        return result.getN() == 1 && result.getError() == null;
    }

    private LegDBObject getLegDBObject(String tripId, String legId) {
        if (!doesTripContainsLeg(tripId, legId)) return null;

        DBCursor cursor = db.getLegCollection().find(new BasicDBObject(LegDBObject.LEG_ID, new ObjectId(legId)));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one leg with id {} found!", legId);
        }

        return LegDBObject.from(cursor.next());
    }

    private boolean doesTripContainsLeg(String tripId, String legId) {
        if (!db.isValidObjectId(legId)) {
            return false;
        }

        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null || !trip.getLegs().contains(legId)) {
            return false;
        }

        return true;
    }
}
