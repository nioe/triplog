package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 14:40
 */
public class StepToDBObjectMap extends PropertyMap<Step, StepDBObject> {

    @Override
    protected void configure() {
        map().setStepId(source.getStepId());
        map().setTripId(source.getTripId());
        map().setStepName(source.getStepName());
        map().setStepText(source.getStepText());
        map().setMapUrl(source.getMapUrl());
        map().setImages(source.getImages());
    }
}