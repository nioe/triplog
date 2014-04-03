package ch.exq.triplog.server.entity;

import javax.xml.bind.annotation.XmlElement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
public class Trip {

    @XmlElement
    private String tripId;

    @XmlElement
    private String tripName;

    @XmlElement
    private String tripDescription;

    @XmlElement
    private List<String> legs;

    public Trip() {
        legs = new ArrayList<>();
    }

    public Trip(String tripName, String tripDescription) {
        this(UUID.randomUUID().toString(), tripName, tripDescription);
    }

    public Trip(String tripId, String tripName, String tripDescription) {
        this();
        this.tripId = tripId;
        this.tripName = tripName;
        this.tripDescription = tripDescription;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
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

    public List<String> getLegs() {
        return legs;
    }

    public void setLegs(List<String> legs) {
        this.legs = legs;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Trip trip = (Trip) o;

        if (tripId != null ? !tripId.equals(trip.tripId) : trip.tripId != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return tripId != null ? tripId.hashCode() : 0;
    }
}
