package ch.exq.triplog.server.core.boundary.json.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDateTime;

public class JsonLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    @Override
    public LocalDateTime deserialize(JsonParser jsonparser, DeserializationContext deserializationcontext) throws IOException {
        return convertToDateTime(jsonparser.getText());
    }
}
