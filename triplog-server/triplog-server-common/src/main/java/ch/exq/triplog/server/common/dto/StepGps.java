package ch.exq.triplog.server.common.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class StepGps extends StepMin {

    private List<GpsPoint> gpsPoints;
    private LocalDate fromDate;

    public StepGps() {
        gpsPoints = new ArrayList<>();
    }

    public List<GpsPoint> getGpsPoints() {
        return gpsPoints;
    }

    public void setGpsPoints(List<GpsPoint> gpsPoints) {
        this.gpsPoints = gpsPoints;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }
}
