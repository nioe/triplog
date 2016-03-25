package ch.exq.triplog.server.core.mapper;

import ch.exq.triplog.server.core.mapper.mappings.DBObjectToPictureMap;
import ch.exq.triplog.server.core.mapper.mappings.DBObjectToStepDetailMap;
import ch.exq.triplog.server.core.mapper.mappings.DBObjectToStepMap;
import ch.exq.triplog.server.core.mapper.mappings.DBObjectToTripMap;
import org.modelmapper.ModelMapper;

import javax.annotation.PostConstruct;
import javax.ejb.Stateless;

@Stateless
public class TriplogMapper extends ModelMapper {

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
