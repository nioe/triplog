package ch.exq.triplog.server.common.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Picture {

    @XmlElement(required = true)
    private String name;

    @XmlElement
    private String url;

    @XmlElement
    private GpsPoint location;

    @XmlElement
    private String caption;

    @XmlElement
    private boolean shownInGallery;

    public Picture() {
    }

    public Picture(String name, GpsPoint location) {
        this(name, location, null, true);
    }

    public Picture(String name, GpsPoint location, String caption, boolean shownInGallery) {
        this.name = name;
        this.location = location;
        this.caption = caption;
        this.shownInGallery = shownInGallery;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public GpsPoint getLocation() {
        return location;
    }

    public void setLocation(GpsPoint location) {
        this.location = location;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public boolean isShownInGallery() {
        return shownInGallery;
    }

    public void setShownInGallery(boolean shownInGallery) {
        this.shownInGallery = shownInGallery;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Picture picture = (Picture) o;

        if (shownInGallery != picture.shownInGallery) return false;
        if (name != null ? !name.equals(picture.name) : picture.name != null) return false;
        if (location != null ? !location.equals(picture.location) : picture.location != null) return false;

        return !(caption != null ? !caption.equals(picture.caption) : picture.caption != null);
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (location != null ? location.hashCode() : 0);
        result = 31 * result + (caption != null ? caption.hashCode() : 0);
        result = 31 * result + (shownInGallery ? 1 : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Picture{" +
                "name='" + name + '\'' +
                ", location=" + location +
                ", caption='" + caption + '\'' +
                ", shownInGallery=" + shownInGallery +
                '}';
    }
}
