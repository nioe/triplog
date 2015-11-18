package ch.exq.triplog.server.core.mapper.mappings;

import ch.exq.triplog.server.common.dto.Picture;
import ch.exq.triplog.server.core.entity.db.PictureDBObject;
import org.modelmapper.PropertyMap;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 18.11.15
 * Time: 17:40
 */
public class DBObjectToPictureMap extends PropertyMap<PictureDBObject, Picture> {

    @Override
    protected void configure() {
        map().setCaptureDate(source.getCaptureDate());
    }
}
