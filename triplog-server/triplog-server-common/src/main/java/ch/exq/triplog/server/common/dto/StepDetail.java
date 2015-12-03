package ch.exq.triplog.server.common.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class StepDetail extends Step {

    @XmlElement
    private String stepText;

    @XmlElement
    private List<Picture> pictures;

    @XmlElement
    private List<GpsPoint> gpsPoints;

    @XmlElement
    private List<String> traveledCountries;

    @XmlElement
    private StepMin previousStep;

    @XmlElement
    private StepMin nextStep;

    public StepDetail() {
        pictures = new ArrayList<>();
        gpsPoints = new ArrayList<>();
        traveledCountries = new ArrayList<>();
    }

    public String getStepText() {
        return stepText;
    }

    public void setStepText(String stepText) {
        this.stepText = stepText;
    }

    public List<Picture> getPictures() {
        return pictures;
    }

    public void setPictures(List<Picture> pictures) {
        this.pictures = pictures;
    }

    public List<GpsPoint> getGpsPoints() {
        return gpsPoints;
    }

    public void setGpsPoints(List<GpsPoint> gpsPoints) {
        this.gpsPoints = gpsPoints;
    }

    public List<String> getTraveledCountries() {
        return traveledCountries;
    }

    public void setTraveledCountries(List<String> traveledCountries) {
        this.traveledCountries = traveledCountries;
    }

    public StepMin getPreviousStep() {
        return previousStep;
    }

    public void setPreviousStep(StepMin previousStep) {
        this.previousStep = previousStep;
    }

    public StepMin getNextStep() {
        return nextStep;
    }

    public void setNextStep(StepMin nextStep) {
        this.nextStep = nextStep;
    }
}
