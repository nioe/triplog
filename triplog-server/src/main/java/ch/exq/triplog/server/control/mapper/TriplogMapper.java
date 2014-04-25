package ch.exq.triplog.server.control.mapper;

import ch.exq.triplog.server.control.mapper.mappings.DBObjectToLegMap;
import ch.exq.triplog.server.control.mapper.mappings.DBObjectToTripMap;
import ch.exq.triplog.server.control.mapper.mappings.LegToDBObjectMap;
import ch.exq.triplog.server.control.mapper.mappings.TripToDBObjectMap;
import org.modelmapper.ModelMapper;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 14:12
 */
@ApplicationScoped
public class TriplogMapper extends ModelMapper {

    public TriplogMapper() {
        super();
    }

    @PostConstruct
    public void conf() {
        //Trip
        addMappings(new DBObjectToTripMap());
        addMappings(new TripToDBObjectMap());

        //Leg
        addMappings(new DBObjectToLegMap());
        addMappings(new LegToDBObjectMap());
    }
}
