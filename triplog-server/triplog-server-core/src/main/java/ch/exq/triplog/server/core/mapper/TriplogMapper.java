package ch.exq.triplog.server.core.mapper;

import ch.exq.triplog.server.core.mapper.mappings.*;
import org.modelmapper.ModelMapper;

import javax.annotation.PostConstruct;
import javax.ejb.Stateless;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:12
 */
@Stateless
public class TriplogMapper extends ModelMapper {

    public TriplogMapper() {
        super();
    }

    @PostConstruct
    public void conf() {
        //Trip
        addMappings(new DBObjectToTripMap());

        //Step
        addMappings(new DBObjectToStepMap());
        addMappings(new DBObjectToStepDetailMap());

        //Picture
        addMappings(new DBObjectToPictureMap());
    }
}
