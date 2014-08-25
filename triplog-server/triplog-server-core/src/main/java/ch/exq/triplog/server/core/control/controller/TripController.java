package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.entity.dao.StepDAO;
import ch.exq.triplog.server.core.entity.dao.TripDAO;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import ch.exq.triplog.server.util.mongodb.MongoDbUtil;
import com.mongodb.WriteResult;
import org.slf4j.Logger;

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

    @Inject
    Logger logger;

    @Inject
    TripDAO tripDAO;

    @Inject
    StepDAO stepDAO;

    @Inject
    ResourceController resourceController;

    @Inject
    TriplogMapper mapper;

    public Trip getTripById(String tripId) {
        if (!MongoDbUtil.isValidObjectId(tripId)) {
            return null;
        }

        TripDBObject tripDBObject = tripDAO.getTripById(tripId);

        return tripDBObject != null ? changeStepLinksFor(mapper.map(tripDBObject, Trip.class)) : null;
    }

    public List<Trip> getAllTrips() {
        List<Trip> allTrips = tripDAO.getAllTrips().stream().map(tripDBObject -> mapper.map(tripDBObject, Trip.class))
                                                            .collect(Collectors.toList());

        allTrips.forEach(t -> changeStepLinksFor(t));

        return allTrips;
    }

    public Trip createTrip(Trip trip) throws DisplayableException {
        if (trip == null || trip.getTripName() == null || trip.getTripName().isEmpty()) {
            throw new DisplayableException("Trip incomplete: At least tripName must be set");
        }

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);

        //We never add steps directly!
        tripDBObject.setSteps(null);

        tripDAO.createTrip(tripDBObject);

        return changeStepLinksFor(mapper.map(tripDBObject, Trip.class));
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

        //We never update steps or the id like this!
        changedTrip.setSteps(null);
        changedTrip.setTripId(null);

        try {
            currentTrip.updateFrom(changedTrip);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Could not update trip!";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        tripDAO.updateTrip(tripId, currentTrip);

        return changeStepLinksFor(mapper.map(currentTrip, Trip.class));
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
        WriteResult stepResult = null;
        if (tripResult.getN() == 1) {
            stepResult = stepDAO.deleteAllStepsOfTrip(tripId);
        }

        return tripResult.getN() == 1 && tripResult.getError() == null && stepResult != null && stepResult.getError() == null;
    }

    private Trip changeStepLinksFor(Trip trip) {
        trip.setSteps(trip.getSteps().stream().map(stepId -> resourceController.getStepUrl(trip.getTripId(), stepId))
                .collect(Collectors.toList()));

        return trip;
    }
}
