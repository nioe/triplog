package ch.exq.triplog.server.util;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonWriter;
import java.io.StringWriter;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
public class JsonUtil {

    public static String toJsonString(JsonObjectProvider jsonObjectProvider) {
        StringWriter stWriter = new StringWriter();
        JsonWriter jsonWriter = Json.createWriter(stWriter);
        jsonWriter.writeObject(jsonObjectProvider.toJson());
        jsonWriter.close();

        return stWriter.toString();
    }

    public static String toJsonArray(List<? extends JsonObjectProvider> jsonObjectProviders) {
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (JsonObjectProvider jsonObjectProvider : jsonObjectProviders) {
            arrayBuilder.add(jsonObjectProvider.toJson());
        }

        StringWriter stWriter = new StringWriter();
        JsonWriter jsonWriter = Json.createWriter(stWriter);
        jsonWriter.writeArray(arrayBuilder.build());
        jsonWriter.close();

        return stWriter.toString();
    }
}
