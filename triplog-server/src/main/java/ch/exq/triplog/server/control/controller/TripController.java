package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.control.exceptions.DisplayableException;
import ch.exq.triplog.server.dto.Trip;
import ch.exq.triplog.server.entity.dao.LegDAO;
import ch.exq.triplog.server.entity.dao.TripDAO;
import ch.exq.triplog.server.entity.db.TripDBObject;
import ch.exq.triplog.server.util.mapper.TriplogMapper;
import ch.exq.triplog.server.util.mongodb.MongoDbUtil;
import com.mongodb.WriteResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 15:58
 */
@Stateless
public class TripController {

    private static final Logger logger = LoggerFactory.getLogger(TripController.class);

    @Inject
    TripDAO tripDAO;

    @Inject
    LegDAO legDAO;

    @Inject
    ResourceController resourceController;

    @Inject
    TriplogMapper mapper;

    public Trip getTripById(String tripId) {
        if (!MongoDbUtil.isValidObjectId(tripId)) {
            return null;
        }

        TripDBObject tripDBObject = tripDAO.getTripById(tripId);

        return tripDBObject != null ? changeLegLinksFor(mapper.map(tripDBObject, Trip.class)) : null;
    }

    public List<Trip> getAllTrips() {
        List<Trip> allTrips = tripDAO.getAllTrips().stream().map(tripDBObject -> mapper.map(tripDBObject, Trip.class))
                                                            .collect(Collectors.toList());

        allTrips.forEach(t -> changeLegLinksFor(t));

        return allTrips;
    }

    public Trip createTrip(Trip trip) throws DisplayableException {
        if (trip == null || trip.getTripName() == null || trip.getTripName().isEmpty()) {
            throw new DisplayableException("Trip incomplete: At least tripName must be set");
        }

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);

        //We never add legs directly!
        tripDBObject.setLegs(null);

        tripDAO.createTrip(tripDBObject);

        return changeLegLinksFor(mapper.map(tripDBObject, Trip.class));
    }

    public Trip updateTrip(String tripId, Trip trip) throws DisplayableException {
        if (trip == null) {
            throw new DisplayableException("Trip must be set");
        }

        if (tripId == null || !MongoDbUtil.isValidObjectId(tripId)) {
            throw new DisplayableException("Invalid trip id");
        }

        TripDBObject currentTrip = tripDAO.getTripById(tripId);
        if (currentTrip == null) {
            throw new DisplayableException("Trip with id " + tripId + " could not be found");
        }

        TripDBObject changedTrip = mapper.map(trip, TripDBObject.class);

        //We never update legs or the id like this!
        changedTrip.setLegs(null);
        changedTrip.setTripId(null);

        try {
            currentTrip.updateFrom(changedTrip);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Could not update trip!";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        tripDAO.updateTrip(tripId, currentTrip);

        return changeLegLinksFor(mapper.map(currentTrip, Trip.class));
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

    private Trip changeLegLinksFor(Trip trip) {
        trip.setLegs(trip.getLegs().stream().map(legId -> resourceController.getLegUrl(trip.getTripId(), legId))
                .collect(Collectors.toList()));

        return trip;
    }
}
