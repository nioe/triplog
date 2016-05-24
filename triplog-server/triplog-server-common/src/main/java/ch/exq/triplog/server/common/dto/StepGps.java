package ch.exq.triplog.server.common.dto;

import java.util.ArrayList;
import java.util.List;

public class StepGps extends StepMin {

    private List<GpsPoint> gpsPoints;

    public StepGps() {
        gpsPoints = new ArrayList<>();
    }

    public List<GpsPoint> getGpsPoints() {
        return gpsPoints;
    }

    public void setGpsPoints(List<GpsPoint> gpsPoints) {
        this.gpsPoints = gpsPoints;
    }
}
