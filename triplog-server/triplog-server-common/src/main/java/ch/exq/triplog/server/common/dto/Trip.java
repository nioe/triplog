package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.json.JsonDateAdapter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 28.03.2014.
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Trip {

    @XmlElement
    private String tripId;

    @XmlElement(required = true)
    private String tripName;

    @XmlElement(required = true)
    @XmlJavaTypeAdapter(JsonDateAdapter.class)
    private LocalDate tripDate;

    @XmlElement(required = true)
    private String tripLead;

    @XmlElement
    private String tripText;

    @XmlElement
    private String coverPicture;

    @XmlElement
    private List<Step> steps;

    public Trip() {
        steps = new ArrayList<>();
    }

    public Trip(String tripName, String tripDescription) {
        this();
        this.tripName = tripName;
        this.tripText = tripDescription;
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

    public LocalDate getTripDate() {
        return tripDate;
    }

    public void setTripDate(LocalDate tripDate) {
        this.tripDate = tripDate;
    }

    public String getTripLead() {
        return tripLead;
    }

    public void setTripLead(String tripLead) {
        this.tripLead = tripLead;
    }

    public String getTripText() {
        return tripText;
    }

    public void setTripText(String tripText) {
        this.tripText = tripText;
    }

    public String getCoverPicture() {
        return coverPicture;
    }

    public void setCoverPicture(String coverPicture) {
        this.coverPicture = coverPicture;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public boolean hasSteps() {
        return steps != null && !steps.isEmpty();
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
