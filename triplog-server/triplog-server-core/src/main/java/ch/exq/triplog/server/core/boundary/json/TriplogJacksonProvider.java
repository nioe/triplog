package ch.exq.triplog.server.core.boundary.json;

import ch.exq.triplog.server.core.boundary.json.serializer.TriplogModule;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;
import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;

@Provider
public class TriplogJacksonProvider implements ContextResolver<ObjectMapper> {
    private final ObjectMapper mapper;

    public TriplogJacksonProvider() {
        mapper = new ObjectMapper();

        mapper.disable(FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.setSerializationInclusion(NON_NULL);

        serializeFieldsOnly();

        mapper.registerModule(new TriplogModule());
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }

    private void serializeFieldsOnly() {
        final VisibilityChecker<?> onlyFields = mapper.getSerializationConfig().getDefaultVisibilityChecker()
                .withFieldVisibility(ANY)
                .withGetterVisibility(NONE)
                .withIsGetterVisibility(NONE)
                .withSetterVisibility(NONE)
                .withCreatorVisibility(NONE);

        mapper.setVisibilityChecker(onlyFields);
    }
}