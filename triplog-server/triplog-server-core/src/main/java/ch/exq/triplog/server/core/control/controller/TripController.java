package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.common.comparator.TripDateComparator;
import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.common.dto.StepGps;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.entity.dao.TripDAO;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import com.mongodb.WriteResult;
import org.slf4j.Logger;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static ch.exq.triplog.server.core.control.controller.filter.PublishedChecker.shouldBeShown;
import static ch.exq.triplog.server.util.id.IdGenerator.generateIdWithYear;

public class TripController {

    private Logger logger;
    private TripDAO tripDAO;
    private StepController stepController;
    private TriplogMapper mapper;

    @Inject
    public TripController(Logger logger, TripDAO tripDAO, StepController stepController, TriplogMapper mapper) {
        this.logger = logger;
        this.tripDAO = tripDAO;
        this.stepController = stepController;
        this.mapper = mapper;
    }

    public Trip getTripById(String tripId, boolean isAuthenticatedUser) {
        TripDBObject tripDBObject = tripDAO.getTripById(tripId);

        if (tripDBObject != null && shouldBeShown(tripDBObject, isAuthenticatedUser)) {
            Trip trip = mapper.map(tripDBObject, Trip.class);
            addStepsToTrip(trip, isAuthenticatedUser);

            return trip;
        }

        return null;
    }

    public List<Trip> getAllTrips(final boolean isAuthenticatedUser) {
        List<Trip> allTrips = tripDAO.getAllTrips().stream()
                .map(tripDBObject -> mapper.map(tripDBObject, Trip.class))
                .filter(trip -> shouldBeShown(trip, isAuthenticatedUser))
                .collect(Collectors.toList());

        allTrips.forEach(trip -> addStepsToTrip(trip, isAuthenticatedUser));
        allTrips.sort(new TripDateComparator());

        return allTrips;
    }

    public Trip createTrip(Trip trip) throws DisplayableException {
        if (trip == null || trip.getTripName() == null || trip.getTripName().isEmpty() || trip.getTripDate() == null) {
            throw new DisplayableException("Trip incomplete: At least tripName and tripDate must be set");
        }

        String tripId = generateIdWithYear(trip.getTripName(), trip.getTripDate());
        trip.setTripId(tripId);

        // We never update created and updated timestamps here
        trip.setCreated(null);
        trip.setLastUpdated(null);

        if (trip.getSteps() == null) {
            trip.setSteps(new ArrayList<>());
        }

        TripDBObject tripDBObject = mapper.map(trip, TripDBObject.class);
        tripDAO.createTrip(tripDBObject);

        return mapper.map(tripDAO.getTripById(tripId), Trip.class);
    }

    public Trip updateTrip(String tripId, Trip trip) throws DisplayableException {
        if (trip == null) {
            throw new DisplayableException("Trip must be set");
        }

        TripDBObject currentTrip = tripDAO.getTripById(tripId);
        if (currentTrip == null) {
            throw new DisplayableException("Trip with id " + tripId + " could not be found");
        }

        TripDBObject changedTrip = mapper.map(trip, TripDBObject.class);

        //We never update the id, created and updated timestamps here
        changedTrip.setTripId(null);
        changedTrip.setCreated(null);
        changedTrip.setLastUpdated(null);

        try {
            currentTrip.updateFrom(changedTrip);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Could not update trip!";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        tripDAO.updateTrip(tripId, currentTrip);

        return getTripById(tripId, true);
    }

    public boolean deleteTripWithId(String tripId) {
        TripDBObject tripDBObject = tripDAO.getTripById(tripId);

        if (tripDBObject == null) {
            return false;
        }

        WriteResult tripResult = tripDAO.deleteTrip(tripDBObject);
        if (tripResult.getN() == 1) {
            stepController.deleteAllStepsOfTrip(tripId);
        }

        return tripResult.getN() == 1 && tripResult.getError() == null;
    }

    public List<StepGps> getAllGpsPointsOfTrip(String tripId, boolean isAuthenticatedUser) {
        return simplifyGpsPoints(stepController.getAllGpsPointsOfTrip(tripId, isAuthenticatedUser));
    }

    private void addStepsToTrip(Trip trip, boolean isAuthenticatedUser) {
        trip.setSteps(stepController.getAllStepsOfTrip(trip.getTripId(), isAuthenticatedUser));
    }

    private List<StepGps> simplifyGpsPoints(List<StepGps> gpsPoints) {
        gpsPoints.stream().forEach(stepGps -> {
            List<GpsPoint> originalGpsPoints = stepGps.getGpsPoints();
            stepGps.setGpsPoints(
                    IntStream.range(0, originalGpsPoints.size())
                            .filter(n -> n == 0 || n == originalGpsPoints.size() - 1 || n % 10 == 0)
                            .mapToObj(originalGpsPoints::get)
                            .collect(Collectors.toList())
            );
        });

        return gpsPoints;
    }
}
