package ch.exq.triplog.server.core.boundary.json.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDate;

public class JsonLocalDateDeserializer extends JsonDeserializer<LocalDate> {
    @Override
    public LocalDate deserialize(JsonParser jsonparser, DeserializationContext deserializationcontext) throws IOException {
        return convertToDate(jsonparser.getText());
    }
}
