package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;
import ch.exq.triplog.server.util.json.JsonDateAdapter;
import ch.exq.triplog.server.util.json.JsonDateTimeAdapter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Step extends StepMin implements MetaDataProvider {

    @XmlElement(required = true)
    private String tripId;

    @XmlElement(required = true)
    @XmlJavaTypeAdapter(JsonDateAdapter.class)
    private LocalDate fromDate;

    @XmlElement(required = true)
    @XmlJavaTypeAdapter(JsonDateAdapter.class)
    private LocalDate toDate;

    @XmlElement(required = true)
    private String stepLead;

    @XmlElement
    private String coverPicture;

    @XmlElement
    @XmlJavaTypeAdapter(JsonDateTimeAdapter.class)
    private LocalDateTime created;

    @XmlElement
    @XmlJavaTypeAdapter(JsonDateTimeAdapter.class)
    private LocalDateTime lastUpdated;

    @XmlElement
    @XmlJavaTypeAdapter(JsonDateTimeAdapter.class)
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
