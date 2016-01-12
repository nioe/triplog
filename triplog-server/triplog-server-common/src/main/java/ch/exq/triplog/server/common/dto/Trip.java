package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Trip implements MetaDataProvider {

    private String tripId;
    private String tripName;
    private LocalDate tripDate;
    private String tripLead;
    private String tripText;
    private String coverPicture;
    private List<Step> steps;
    private LocalDateTime created;
    private LocalDateTime lastUpdated;
    private LocalDateTime published;

    public Trip() {
        steps = new ArrayList<>();
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

    public LocalDateTime getCreated() {
        return created;
    }

    public void setCreated(LocalDateTime created) {
        this.created = created;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getPublished() {
        return published;
    }

    public void setPublished(LocalDateTime published) {
        this.published = published;
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
