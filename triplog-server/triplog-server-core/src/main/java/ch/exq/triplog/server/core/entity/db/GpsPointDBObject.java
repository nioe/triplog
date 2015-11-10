package ch.exq.triplog.server.core.entity.db;

import com.mongodb.BasicDBObject;

import java.math.BigDecimal;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 02.06.15
 * Time: 17:08
 */
public class GpsPointDBObject extends BasicDBObject {

    private static final String LATITUDE = "latitude";
    private static final String LONGITUDE = "longitude";

    public GpsPointDBObject() {
    }

    public GpsPointDBObject(BasicDBObject object) {
        String latitude = (String) object.get(LATITUDE);
        String longitude = (String) object.get(LONGITUDE);

        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Invalid null value for longitude or latitude while parsing GPSPointDBObject from DBObject");
        }

        setLatitude(new BigDecimal(latitude));
        setLongitude(new BigDecimal(longitude));
    }

    public GpsPointDBObject(BigDecimal latitude, BigDecimal longitude) {
        setLatitude(latitude);
        setLongitude(longitude);
    }

    public BigDecimal getLongitude() {
        return new BigDecimal(getString(LONGITUDE));
    }

    public void setLongitude(BigDecimal longitude) {
        put(LONGITUDE, longitude.toString());
    }

    public BigDecimal getLatitude() {
        return new BigDecimal(getString(LATITUDE));
    }

    public void setLatitude(BigDecimal latitude) {
        put(LATITUDE, latitude.toString());
    }
}
