package ch.exq.triplog.server.common.dto;

import java.util.ArrayList;
import java.util.List;

public class StepDetail extends Step {

    private String stepText;
    private List<Picture> pictures;
    private List<GpsPoint> gpsPoints;
    private List<String> traveledCountries;
    private StepMin previousStep;
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
