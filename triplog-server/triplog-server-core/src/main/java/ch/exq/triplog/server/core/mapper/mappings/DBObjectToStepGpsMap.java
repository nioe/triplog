package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.StepGps;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 14:38
 */
public class DBObjectToStepGpsMap extends PropertyMap<StepDBObject, StepGps> {

    @Override
    protected void configure() {
        map().setFromDate(source.getFromDate());
    }
}
