package ch.exq.triplog.server.core.mapper;

import ch.exq.triplog.server.core.mapper.mappings.*;
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
