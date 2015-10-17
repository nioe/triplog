package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.json.JsonDateAdapter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDate;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 16:26
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Step {
    @XmlElement
    private String stepId;

    @XmlElement(required = true)
    private String tripId;

    @XmlElement(required = true)
    private String stepName;

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

    public Step() {

    }

    public Step(String stepId, String tripId, String stepName, LocalDate fromDate, LocalDate toDate, String stepLead, String coverPicture) {
        this.stepId = stepId;
        this.tripId = tripId;
        this.stepName = stepName;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.stepLead = stepLead;
        this.coverPicture = coverPicture;
    }

    public String getStepId() {
        return stepId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Step step = (Step) o;

        if (stepId != null ? !stepId.equals(step.stepId) : step.stepId != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return stepId != null ? stepId.hashCode() : 0;
    }
}