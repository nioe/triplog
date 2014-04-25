package ch.exq.triplog.server.entity.mapper.mappings;

import ch.exq.triplog.server.entity.dto.Trip;
import ch.exq.triplog.server.entity.db.TripDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:22
 */
public class DBObjectToTripMap extends PropertyMap<TripDBObject, Trip> {

    @Override
    protected void configure() {
        map().setTripId(source.getTripId());
        map().setTripName(source.getTripName());
        map().setTripDescription(source.getTripDescription());
        map().setLegs(source.getLegs());
    }
}
