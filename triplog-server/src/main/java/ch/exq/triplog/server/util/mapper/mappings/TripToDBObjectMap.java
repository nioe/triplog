package ch.exq.triplog.server.util.mapper.mappings;

import ch.exq.triplog.server.dto.Trip;
import ch.exq.triplog.server.entity.db.TripDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:15
 */
public class TripToDBObjectMap extends PropertyMap<Trip, TripDBObject> {
    @Override
    protected void configure() {
        map().setTripId(source.getTripId());
        map().setTripName(source.getTripName());
        map().setTripDescription(source.getTripDescription());
        map().setLegs(source.getLegs());
    }
}
