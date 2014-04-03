package ch.exq.triplog.server.entity.dao;

import ch.exq.triplog.server.entity.Leg;
import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.data.TripLogData;

import javax.inject.Inject;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
public class LegDAO {

    @Inject
    TripDAO tripDAO;

    @Inject
    TripLogData data;

    public List<Leg> getAllLegsOfTrip(String tripId) {
        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null) {
            return null;
        }

        return trip.getLegs().stream()
                             .map(id -> data.getLegs().get(id))
                             .collect(Collectors.toList());
    }
}
