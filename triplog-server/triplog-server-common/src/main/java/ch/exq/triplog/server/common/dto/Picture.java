package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.json.JsonDateTimeAdapter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDateTime;

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
    @XmlJavaTypeAdapter(JsonDateTimeAdapter.class)
    private LocalDateTime captureDate;

    @XmlElement
    private int width;

    @XmlElement
    private int height;

    @XmlElement
    private boolean shownInGallery;

    public Picture() {
    }

    public Picture(String name, GpsPoint location, LocalDateTime captureDate, int width, int height) {
        this(name, location, null, captureDate, width, height, true);
    }

    public Picture(String name, GpsPoint location, LocalDateTime captureDate) {
        this(name, location, null, captureDate, 0, 0, true);
    }

    public Picture(String name, GpsPoint location, String caption, LocalDateTime captureDate, int width, int height, boolean shownInGallery) {
        this.name = name;
        this.location = location;
        this.caption = caption;
        this.captureDate = captureDate;
        this.width = width;
        this.height = height;
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

    public LocalDateTime getCaptureDate() {
        return captureDate;
    }

    public void setCaptureDate(LocalDateTime captureDate) {
        this.captureDate = captureDate;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
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

        if (width != picture.width) return false;
        if (height != picture.height) return false;
        if (shownInGallery != picture.shownInGallery) return false;
        if (name != null ? !name.equals(picture.name) : picture.name != null) return false;
        if (location != null ? !location.equals(picture.location) : picture.location != null) return false;
        if (caption != null ? !caption.equals(picture.caption) : picture.caption != null) return false;
        return !(captureDate != null ? !captureDate.equals(picture.captureDate) : picture.captureDate != null);

    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (location != null ? location.hashCode() : 0);
        result = 31 * result + (caption != null ? caption.hashCode() : 0);
        result = 31 * result + (captureDate != null ? captureDate.hashCode() : 0);
        result = 31 * result + width;
        result = 31 * result + height;
        result = 31 * result + (shownInGallery ? 1 : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Picture{" +
                "shownInGallery=" + shownInGallery +
                ", height=" + height +
                ", width=" + width +
                ", captureDate=" + captureDate +
                ", caption='" + caption + '\'' +
                ", location=" + location +
                ", name='" + name + '\'' +
                '}';
    }
}
