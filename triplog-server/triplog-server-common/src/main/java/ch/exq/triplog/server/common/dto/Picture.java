package ch.exq.triplog.server.common.dto;

import java.time.LocalDateTime;

public class Picture {

    private String name;
    private String url;
    private GpsPoint location;
    private String caption;
    private LocalDateTime captureDate;
    private int width;
    private int height;
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

        if (name != null ? !name.equals(picture.name) : picture.name != null) return false;
        return !(location != null ? !location.equals(picture.location) : picture.location != null);
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (location != null ? location.hashCode() : 0);

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
