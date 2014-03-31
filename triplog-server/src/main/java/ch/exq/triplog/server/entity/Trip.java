package ch.exq.triplog.server.entity;

import javax.xml.bind.annotation.XmlElement;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
public class Trip {

    @XmlElement
    private int tripId;

    @XmlElement
    private String tripName;

    @XmlElement
    private String tripDescription;

    public Trip() {
    }

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
