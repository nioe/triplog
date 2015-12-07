package ch.exq.triplog.server.core.entity.dao;

import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
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
public class TripDAO {

    private Logger logger;
    private TriplogDB db;

    public TripDAO() {}

    @Inject
    public TripDAO(Logger logger, TriplogDB db) {
        this.logger = logger;
        this.db = db;
    }

    public List<TripDBObject> getAllTrips() {
        List<TripDBObject> trips = new ArrayList<>();

        DBCursor cursor = db.getTripCollection().find();
        while (cursor.hasNext()) {
            trips.add(TripDBObject.from(cursor.next()));
        }

        return trips;
    }

    public TripDBObject getTripById(String tripId) {
        DBCursor cursor = db.getTripCollection().find(idDBObject(tripId));
        if (cursor.count() == 0) {
            return null;
        } else if (cursor.count() > 1) {
            logger.warn("More than one trip with id {} found!", tripId);
        }

        return TripDBObject.from(cursor.next());
    }

    public WriteResult createTrip(TripDBObject trip) throws DisplayableException {
        trip.setCreated(now());
        return db.getTripCollection().insert(trip);
    }

    public WriteResult deleteTrip(TripDBObject trip) {
        return db.getTripCollection().remove(trip);
    }

    public WriteResult updateTrip(String tripId, TripDBObject trip) {
        trip.setLastUpdated(now());
        return db.getTripCollection().update(idDBObject(tripId), trip);
    }

    private BasicDBObject idDBObject(String tripId) {
        return new BasicDBObject(TripDBObject.TRIP_ID, tripId);
    }
}
