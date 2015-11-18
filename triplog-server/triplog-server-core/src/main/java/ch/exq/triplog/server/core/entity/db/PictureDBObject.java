package ch.exq.triplog.server.core.entity.db;

import com.mongodb.BasicDBObject;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.time.LocalDateTime;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDateTime;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 09.11.15
 * Time: 07:42
 */
public class PictureDBObject extends AbstractDBObject<PictureDBObject> {

    @Inject
    Logger logger;

    private static final String NAME = "name";
    private static final String LOCATION = "location";
    private static final String CAPTION = "caption";
    private static final String CAPTURE_DATE = "captureDate";
    private static final String WIDTH = "width";
    private static final String HEIGHT = "height";
    private static final String SHOWN_IN_GALLERY = "shownInGallery";

    public PictureDBObject() {
    }

    public PictureDBObject(BasicDBObject object) {
        setName(object.getString(NAME));

        BasicDBObject location = (BasicDBObject) object.get(LOCATION);
        setLocation(location != null ? new GpsPointDBObject(location) : null);

        setCaption(object.getString(CAPTION));
        setCaptureDate(convertToDateTime(object.getString(CAPTURE_DATE)));

        String width = object.getString(WIDTH);
        setWidth(width != null ? object.getInt(WIDTH) : 0);

        String height = object.getString(HEIGHT);
        setHeight(height != null ? object.getInt(HEIGHT) : 0);

        setShownInGallery(object.getBoolean(SHOWN_IN_GALLERY));
    }

    public PictureDBObject(String name, GpsPointDBObject location, String caption, LocalDateTime captureDate, int width, int height, boolean showInGallery) {
        setName(name);
        setLocation(location);
        setCaption(caption);
        setCaptureDate(captureDate);
        setWidth(width);
        setHeight(height);
        setShownInGallery(showInGallery);
    }

    public String getName() {
        return getString(NAME);
    }

    public void setName(String name) {
        put(NAME, name);
    }

    public GpsPointDBObject getLocation() {
        BasicDBObject location = (BasicDBObject) get(LOCATION);
        return location != null ? new GpsPointDBObject(location) : null;
    }

    public void setLocation(GpsPointDBObject location) {
        put(LOCATION, location);
    }

    public String getCaption() {
        return getString(CAPTION);
    }

    public void setCaption(String caption) {
        put(CAPTION, caption);
    }

    public LocalDateTime getCaptureDate() {
        return convertToDateTime(getString(CAPTURE_DATE));
    }

    public void setCaptureDate(LocalDateTime captureDate) {
        put(CAPTURE_DATE, convertToString(captureDate));
    }

    public int getWidth() {
        return getInt(WIDTH);
    }

    public void setWidth(int width) {
        put(WIDTH, width);
    }

    public int getHeight() {
        return getInt(HEIGHT);
    }

    public void setHeight(int height) {
        put(HEIGHT, height);
    }

    public boolean isShownInGallery() {
        return getBoolean(SHOWN_IN_GALLERY);
    }

    public void setShownInGallery(boolean showInGallery) {
        put(SHOWN_IN_GALLERY, showInGallery);
    }

    @Override
    protected Logger logger() {
        return logger;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        PictureDBObject that = (PictureDBObject) o;

        return !(getName() != null ? !getName().equals(that.getName()) : that.getName() != null);
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (getName() != null ? getName().hashCode() : 0);

        return result;
    }
}
