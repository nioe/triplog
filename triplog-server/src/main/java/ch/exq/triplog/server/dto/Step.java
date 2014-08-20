package ch.exq.triplog.server.dto;

import ch.exq.triplog.server.util.misc.UUIDUtil;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
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

    @XmlElement
    private String stepText;

    @XmlElement
    private String mapUrl;

    @XmlElement
    private List<String> images;

    public Step() {
        images = new ArrayList<>();
    }

    public Step(String tripId, String stepName, String stepText, String mapUrl) {
        this(UUIDUtil.getRandomUUID(), tripId, stepName, stepText, mapUrl);
    }

    public Step(String stepId, String tripId, String stepName, String stepText, String mapUrl) {
        this();
        this.stepId = stepId;
        this.stepName = stepName;
        this.stepText = stepText;
        this.mapUrl = mapUrl;
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

    public String getStepText() {
        return stepText;
    }

    public void setStepText(String stepText) {
        this.stepText = stepText;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
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
