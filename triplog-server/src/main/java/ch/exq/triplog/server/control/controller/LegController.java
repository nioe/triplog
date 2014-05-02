package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.control.exceptions.DisplayableException;
import ch.exq.triplog.server.dto.Leg;
import ch.exq.triplog.server.entity.dao.LegDAO;
import ch.exq.triplog.server.entity.dao.TripDAO;
import ch.exq.triplog.server.entity.db.LegDBObject;
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
public class LegController {

    private static final Logger logger = LoggerFactory.getLogger(LegController.class);

    @Inject
    TripDAO tripDAO;

    @Inject
    LegDAO legDAO;

    @Inject
    ResourceController resourceController;

    @Inject
    TriplogMapper mapper;


    public List<Leg> getAllLegsOfTrip(String tripId) {
        if (tripDAO.getTripById(tripId) == null) {
            return null;
        }

        List<Leg> allLegs = legDAO.getAllLegsOfTrip(tripId).stream().map(legDBObject -> mapper.map(legDBObject, Leg.class))
                .collect(Collectors.toList());

        allLegs.forEach(l -> changeImageLinksFor(l));

        return allLegs;
    }

    public Leg getLeg(String tripId, String legId) {
        if (!doesTripContainsLeg(tripId, legId)) return null;

        LegDBObject legDBObject = legDAO.getLeg(legId);
        return legDBObject != null ? changeImageLinksFor(mapper.map(legDBObject, Leg.class)) : null;
    }

    public Leg createLeg(Leg leg) throws DisplayableException {
        if (leg.getTripId() == null || tripDAO.getTripById(leg.getTripId()) == null) {
            throw new DisplayableException("Could not find trip with id " + leg.getTripId());
        }

        if (leg == null || leg.getLegName() == null || leg.getLegName().isEmpty()) {
            throw new DisplayableException("Leg incomplete: legName must be set");
        }

        LegDBObject legDBObject = mapper.map(leg, LegDBObject.class);

        //We never add images directly
        legDBObject.setImages(null);

        legDAO.createLeg(legDBObject);

        tripDAO.addLegToTrip(legDBObject.getTripId(), legDBObject.getLegId());

        return changeImageLinksFor(mapper.map(legDBObject, Leg.class));
    }

    public Leg updateLeg(String tripId, String legId, Leg leg) throws DisplayableException {
        if (!doesTripContainsLeg(tripId, legId)) {
            throw new DisplayableException("Either trip " + tripId + " could not be found or it does not contain leg " + legId);
        }

        LegDBObject currentLeg = legDAO.getLeg(legId);
        if (currentLeg == null) {
            throw new DisplayableException("Leg " + legId + " could not be found");
        }

        LegDBObject changedLeg = mapper.map(leg, LegDBObject.class);

        //We never change ids or images like this
        changedLeg.setLegId(null);
        changedLeg.setTripId(null);
        changedLeg.setImages(null);

        try {
            currentLeg.updateFrom(changedLeg);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Leg could not be updated";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        legDAO.updateLeg(legId, currentLeg);

        return changeImageLinksFor(mapper.map(currentLeg, Leg.class));
    }

    public boolean deleteLeg(String tripId, String legId) {
        if (!doesTripContainsLeg(tripId, legId)) return false;

        LegDBObject legDBObject = legDAO.getLeg(legId);
        if (legDBObject == null) {
            return false;
        }

        tripDAO.removeLegFromTrip(tripId, legId);

        WriteResult result = legDAO.deleteLeg(legDBObject);
        return result.getN() == 1 && result.getError() == null;
    }

    private boolean doesTripContainsLeg(String tripId, String legId) {
        if (!MongoDbUtil.isValidObjectId(tripId, legId)) {
            return false;
        }

        TripDBObject trip = tripDAO.getTripById(tripId);
        if (trip == null || !trip.getLegs().contains(legId)) {
            return false;
        }

        return true;
    }

    private Leg changeImageLinksFor(Leg leg) {
        leg.setImages(leg.getImages().stream().map(imageId -> resourceController.getImageUrl(imageId))
                .collect(Collectors.toList()));

        return leg;
    }
}
