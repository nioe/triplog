package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Step extends StepMin implements MetaDataProvider {

    private String tripId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String stepLead;
    private String coverPicture;
    private LocalDateTime created;
    private LocalDateTime lastUpdated;
    private LocalDateTime published;

    public Step() {
    }

    public Step(String stepId, String tripId, String stepName, LocalDate fromDate, LocalDate toDate, String stepLead, String coverPicture) {
        super(stepId, stepName);

        this.tripId = tripId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.stepLead = stepLead;
        this.coverPicture = coverPicture;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public String getStepLead() {
        return stepLead;
    }

    public void setStepLead(String stepLead) {
        this.stepLead = stepLead;
    }

    public String getCoverPicture() {
        return coverPicture;
    }

    public void setCoverPicture(String coverPicture) {
        this.coverPicture = coverPicture;
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
}
