package ch.exq.triplog.server.entity;

import ch.exq.triplog.server.util.JsonObjectProvider;

import javax.json.Json;
import javax.json.JsonObject;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
public class Trip implements JsonObjectProvider {

    private int tripId;
    private String tripName;
    private String tripDescription;

    public Trip(int tripId, String tripName, String tripDescription) {
        this.tripId = tripId;
        this.tripName = tripName;
        this.tripDescription = tripDescription;
    }

    public int getTripId() {
        return tripId;
    }

    public void setTripId(int tripId) {
        this.tripId = tripId;
    }

    public String getTripName() {
        return tripName;
    }

    public void setTripName(String tripName) {
        this.tripName = tripName;
    }

    public String getTripDescription() {
        return tripDescription;
    }

    public void setTripDescription(String tripDescription) {
        this.tripDescription = tripDescription;
    }

    @Override
    public JsonObject toJson() {
        return Json.createObjectBuilder()
                .add("tripId", tripId)
                .add("tripName", tripName)
                .add("tripDescription", tripDescription)
                .build();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Trip trip = (Trip) o;

        if (tripId != trip.tripId) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return tripId;
    }
}
