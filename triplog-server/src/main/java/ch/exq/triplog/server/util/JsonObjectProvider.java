package ch.exq.triplog.server.util;

import javax.json.JsonObject;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
public interface JsonObjectProvider {

    public JsonObject toJson();
}
