package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.db.TripDBObject;
import ch.exq.triplog.server.entity.db.TriplogDb;
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
    private final static Logger logger = LoggerFactory.getLogger(TripDAO.class);

    @Inject
    TriplogDb db;

    @Inject
    TriplogMapper mapper;

    public List<Trip> getAllTrips() {
        List<Trip> trips = new ArrayList<>();

        DBCursor cursor = db.getDb().getCollection(TripDBObject.COLLECTION_NAME).find();
        while (cursor.hasNext()) {
            TripDBObject tripDBObject = TripDBObject.from(cursor.next());
            trips.add(mapper.map(tripDBObject, Trip.class));
        }

        return trips;
    }

    public Trip getTripById(String tripId) {
        DBCursor cursor = db.getDb().getCollection(TripDBObject.COLLECTION_NAME).find(new BasicDBObject(TripDBObject.TRIP_ID, new ObjectId(tripId)));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one trip with id {} found!", tripId);
        }

        return mapper.map(TripDBObject.from(cursor.next()), Trip.class);
    }

    public Trip createTrip(Trip trip) {
        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        db.getDb().getCollection(TripDBObject.COLLECTION_NAME).insert(tripDBObject);

        return mapper.map(tripDBObject, Trip.class);
    }
}
