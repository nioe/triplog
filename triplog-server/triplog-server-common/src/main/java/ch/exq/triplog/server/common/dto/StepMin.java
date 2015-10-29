package ch.exq.triplog.server.common.dto;

import javax.xml.bind.annotation.XmlElement;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 29.10.15
 * Time: 07:44
 */
public class StepMin {

    @XmlElement
    private String stepId;

    @XmlElement(required = true)
    private String stepName;

    public StepMin() {

    }

    public StepMin(String stepId, String stepName) {
        this.stepId = stepId;
        this.stepName = stepName;
    }

    public StepMin(Step step) {
        this.stepId = step.getStepId();
        this.stepName = step.getStepName();
    }

    public String getStepId() {
        return stepId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StepMin)) return false;

        StepMin other = (StepMin) o;

        return !(this.stepId != null ? !this.stepId.equals(other.stepId) : other.stepId != null);
    }

    @Override
    public int hashCode() {
        return getStepId() != null ? getStepId().hashCode() : 0;
    }
}
