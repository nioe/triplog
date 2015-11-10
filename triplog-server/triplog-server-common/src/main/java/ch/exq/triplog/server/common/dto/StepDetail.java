package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.id.IdGenerator;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
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
    private StepMin previousStep;

    @XmlElement
    private StepMin nextStep;

    public StepDetail() {
        pictures = new ArrayList<>();
        gpsPoints = new ArrayList<>();
    }

    public StepDetail(String tripId, String stepName, LocalDate fromDate, LocalDate toDate, String stepLead,
                      String stepText, List<Picture> pictures, List<GpsPoint> gpsPoints, String coverPicture) {
        this(IdGenerator.generateIdWithFullDate(stepName, fromDate), tripId, stepName, fromDate, toDate, stepLead,
                stepText, pictures, gpsPoints, coverPicture);
    }

    public StepDetail(String stepId, String tripId, String stepName, LocalDate fromDate, LocalDate toDate, String stepLead,
                      String stepText, List<Picture> pictures, List<GpsPoint> gpsPoints, String coverPicture) {

        super(stepId, tripId, stepName, fromDate, toDate, stepLead, coverPicture);
        this.stepText = stepText;
        this.pictures = pictures;
        this.gpsPoints = gpsPoints;
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
