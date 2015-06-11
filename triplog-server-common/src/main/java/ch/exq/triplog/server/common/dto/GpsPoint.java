package ch.exq.triplog.server.common.dto;

import java.math.BigDecimal;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 15:37
 */
public class GpsPoint {
    private BigDecimal latitude;
    private BigDecimal longitude;

    public GpsPoint() {
    }

    public GpsPoint(BigDecimal latitude, BigDecimal longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public GpsPoint(String latitude, String longitude) {
        this.latitude = new BigDecimal(latitude);
        this.longitude = new BigDecimal(longitude);
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GpsPoint gpsPoint = (GpsPoint) o;

        if (latitude != null ? !latitude.equals(gpsPoint.latitude) : gpsPoint.latitude != null) return false;
        return !(longitude != null ? !longitude.equals(gpsPoint.longitude) : gpsPoint.longitude != null);

    }

    @Override
    public int hashCode() {
        int result = latitude != null ? latitude.hashCode() : 0;
        result = 31 * result + (longitude != null ? longitude.hashCode() : 0);
        return result;
    }
}
