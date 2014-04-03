package ch.exq.triplog.server.entity;

import javax.xml.bind.annotation.XmlElement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
public class Leg {

    @XmlElement
    private final String legId;

    @XmlElement
    private String legName;

    @XmlElement
    private String legText;

    @XmlElement
    private String mapUrl;

    @XmlElement
    private List<String> images;

    public Leg() {
        legId = UUID.randomUUID().toString();
        images = new ArrayList<>();
    }

    public Leg(String legName, String legText, String mapUrl) {
        this();
        this.legName = legName;
        this.legText = legText;
        this.mapUrl = mapUrl;
    }

    public String getLegId() {
        return legId;
    }

    public String getLegName() {
        return legName;
    }

    public void setLegName(String legName) {
        this.legName = legName;
    }

    public String getLegText() {
        return legText;
    }

    public void setLegText(String legText) {
        this.legText = legText;
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

        Leg leg = (Leg) o;

        if (legId != null ? !legId.equals(leg.legId) : leg.legId != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return legId != null ? legId.hashCode() : 0;
    }
}