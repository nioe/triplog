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
public class LegController {

    @Inject
    TripDAO tripDAO;

    @Inject
    LegDAO legDAO;

    @Inject
    TriplogMapper mapper;


    public List<Leg> getAllLegsOfTrip(String tripId) {
        if (tripDAO.getTripById(tripId) == null) {
            return null;
        }

        return legDAO.getAllLegsOfTrip(tripId).stream().map(legDBObject -> mapper.map(legDBObject, Leg.class))
                                                       .collect(Collectors.toList());
    }

    public Leg getLeg(String tripId, String legId) {
        if (!doesTripContainsLeg(tripId, legId)) return null;

        LegDBObject legDBObject = legDAO.getLeg(legId);
        return legDBObject != null ? mapper.map(legDBObject, Leg.class) : null;
    }

    public Leg createLeg(Leg leg) throws DisplayableException {
        if (leg.getTripId() == null || tripDAO.getTripById(leg.getTripId()) == null) {
            throw new DisplayableException("Could not find trip with id " + leg.getTripId());
        }

        if (leg == null || leg.getLegName() == null || leg.getLegName().isEmpty()) {
            throw new DisplayableException("Leg incomplete: legName must be set");
        }

        LegDBObject legDBObject = mapper.map(leg, LegDBObject.class);
        legDAO.createLeg(legDBObject);

        tripDAO.addLegToTrip(legDBObject.getTripId(), legDBObject.getLegId());

        return mapper.map(legDBObject, Leg.class);
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
}
