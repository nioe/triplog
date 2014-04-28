package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.control.exceptions.CreationException;
import ch.exq.triplog.server.dto.Trip;
import ch.exq.triplog.server.entity.dao.LegDAO;
import ch.exq.triplog.server.entity.dao.TripDAO;
import ch.exq.triplog.server.entity.db.TripDBObject;
import ch.exq.triplog.server.util.mapper.TriplogMapper;
import ch.exq.triplog.server.util.mongodb.MongoDbUtil;
import com.mongodb.WriteResult;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 15:58
 */
@Stateless
public class TripController {

    @Inject
    TripDAO tripDAO;

    @Inject
    LegDAO legDAO;

    @Inject
    TriplogMapper mapper;

    public Trip getTripById(String tripId) {
        if (!MongoDbUtil.isValidObjectId(tripId)) {
            return null;
        }

        TripDBObject tripDBObject = tripDAO.getTripById(tripId);
        return tripDBObject != null ? mapper.map(tripDBObject, Trip.class) : null;
    }

    public List<Trip> getAllTrips() {
        return tripDAO.getAllTrips().stream().map(tripDBObject -> mapper.map(tripDBObject, Trip.class))
                                             .collect(Collectors.toList());
    }

    public Trip createTrip(Trip trip) throws CreationException{
        if (trip == null || trip.getTripName() == null || trip.getTripName().isEmpty()) {
            throw new CreationException("Trip incomplete: At least tripName must be set");
        }

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);

        //We never add legs directly!
        tripDBObject.setLegs(null);

        tripDAO.createTrip(tripDBObject);

        return mapper.map(tripDBObject, Trip.class);
    }

    public boolean deleteTripWithId(String tripId) {
        if (!MongoDbUtil.isValidObjectId(tripId)) {
            return false;
        }

        TripDBObject tripDBObject = tripDAO.getTripById(tripId);

        if (tripDBObject == null) {
            return false;
        }

        WriteResult tripResult = tripDAO.deleteTrip(tripDBObject);
        WriteResult legResult = null;
        if (tripResult.getN() == 1) {
            //Delete legs of trip
            legResult = legDAO.deleteAllLegsOfTrip(tripId);
        }

        return tripResult.getN() == 1 && tripResult.getError() == null && legResult != null && legResult.getError() == null;
    }
}
