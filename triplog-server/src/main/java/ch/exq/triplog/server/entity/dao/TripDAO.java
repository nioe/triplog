package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.db.TripDBObject;
import ch.exq.triplog.server.entity.db.TriplogDB;
import ch.exq.triplog.server.entity.mapper.TriplogMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
@Stateless
public class TripDAO {
    private static final Logger logger = LoggerFactory.getLogger(TripDAO.class);

    @Inject
    TriplogDB db;

    @Inject
    TriplogMapper mapper;

    public List<Trip> getAllTrips() {
        List<Trip> trips = new ArrayList<>();

        DBCursor cursor = db.getTripCollection().find();
        while (cursor.hasNext()) {
            trips.add(mapper.map(TripDBObject.from(cursor.next()), Trip.class));
        }

        return trips;
    }

    public Trip getTripById(String tripId) {
        TripDBObject tripDBObject = getTripDBObjectById(tripId);
        return tripDBObject == null ? null : mapper.map(tripDBObject, Trip.class);
    }

    public Trip createTrip(Trip trip) {
        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);

        //We never add legs directly!
        tripDBObject.setLegs(null);

        db.getTripCollection().insert(tripDBObject);

        return mapper.map(tripDBObject, Trip.class);
    }

    public Trip addLeg(String tripId, String legId) {
        TripDBObject tripDBObject = getTripDBObjectById(tripId);
        tripDBObject.getLegList().add(legId);

        db.getTripCollection().update(idDBObject(tripId), tripDBObject);

        return mapper.map(tripDBObject, Trip.class);
    }


    private TripDBObject getTripDBObjectById(String tripId) {
        DBCursor cursor = db.getTripCollection().find(idDBObject(tripId));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one trip with id {} found!", tripId);
        }

        return TripDBObject.from(cursor.next());
    }

    private BasicDBObject idDBObject(String tripId) {
        return new BasicDBObject(TripDBObject.TRIP_ID, new ObjectId(tripId));
    }
}
