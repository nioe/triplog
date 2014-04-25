package ch.exq.triplog.server.control.mapper.mappings;

import ch.exq.triplog.server.entity.dto.Leg;
import ch.exq.triplog.server.entity.db.LegDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 14:40
 */
public class LegToDBObjectMap extends PropertyMap<Leg, LegDBObject> {

    @Override
    protected void configure() {
        map().setLegId(source.getLegId());
        map().setTripId(source.getTripId());
        map().setLegName(source.getLegName());
        map().setLegText(source.getLegText());
        map().setMapUrl(source.getMapUrl());
        map().setImages(source.getImages());
    }
}
