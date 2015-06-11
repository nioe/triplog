package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 14:38
 */
public class DBObjectToStepDetailMap extends PropertyMap<StepDBObject, StepDetail> {

    @Override
    protected void configure() {
        map().setFromDate(source.getFromDate());
        map().setToDate(source.getToDate());
    }
}
