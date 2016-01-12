package ch.exq.triplog.server.core.boundary.json.serializer;

import com.fasterxml.jackson.databind.module.SimpleModule;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TriplogModule extends SimpleModule {

    public static final String MODULE_NAME = "Triplog Jackson Module";

    public TriplogModule() {
        super(MODULE_NAME);

        addDeserializer(LocalDate.class, new JsonLocalDateDeserializer());
        addDeserializer(LocalDateTime.class, new JsonLocalDateTimeDeserializer());

        addSerializer(LocalDate.class, new JsonLocalDateSerializer());
        addSerializer(LocalDateTime.class, new JsonLocalDateTimeSerializer());
    }
}
