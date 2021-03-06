package ch.exq.triplog.server.common.dto;

import java.math.BigDecimal;

public class GpsPoint {

    private BigDecimal lat;
    private BigDecimal lng;

    public GpsPoint() {
    }

    public GpsPoint(BigDecimal latitude, BigDecimal longitude) {
        this.lat = latitude;
        this.lng = longitude;
    }

    public GpsPoint(String latitude, String longitude) {
        this.lat = new BigDecimal(latitude);
        this.lng = new BigDecimal(longitude);
    }

    public BigDecimal getLatitude() {
        return lat;
    }

    public void setLatitude(BigDecimal latitude) {
        this.lat = latitude;
    }

    public BigDecimal getLongitude() {
        return lng;
    }

    public void setLongitude(BigDecimal longitude) {
        this.lng = longitude;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GpsPoint gpsPoint = (GpsPoint) o;

        if (lat != null ? !lat.equals(gpsPoint.lat) : gpsPoint.lat != null) return false;
        return !(lng != null ? !lng.equals(gpsPoint.lng) : gpsPoint.lng != null);

    }

    @Override
    public int hashCode() {
        int result = lat != null ? lat.hashCode() : 0;
        result = 31 * result + (lng != null ? lng.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "GpsPoint{" +
                "lat=" + lat +
                ", lng=" + lng +
                '}';
    }
}
