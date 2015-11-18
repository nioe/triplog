package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.common.dto.Picture;
import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import ch.exq.triplog.server.util.picture.PictureSize;
import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.lang.GeoLocation;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import static ch.exq.triplog.server.util.misc.UUIDUtil.getRandomUUID;

public class PictureController {

    @Inject
    Logger logger;

    @Inject
    StepController stepController;

    @Inject
    @Config(key = "triplog.media.path", description = "Path on server where pictures are stored")
    SystemProperty mediaPath;

    public File getPicture(String tripId, String stepId, String pictureName) {
        File picture = getPicturePath(tripId, stepId, pictureName).toFile();
        return picture.exists() ? picture : null;
    }

    public String savePicture(String tripId, String stepId, String pictureName, byte[] content) throws IOException, DisplayableException {
        StepDetail step = stepController.getStep(tripId, stepId);
        if (step == null) {
            throw new IllegalArgumentException("Given step could not be found!");
        }

        String pictureExtension = pictureName.substring(pictureName.lastIndexOf('.'));
        String uniquePictureName = getRandomUUID() + pictureExtension;

        Path picturePath = getPicturePath(tripId, stepId, uniquePictureName);
        Files.createDirectories(picturePath.getParent());
        Files.write(picturePath, content, StandardOpenOption.CREATE_NEW);

        Metadata metadata = null;
        try {
            metadata = ImageMetadataReader.readMetadata(picturePath.toFile());
        } catch (ImageProcessingException e) {
            logger.warn("Could not read metadata of " + picturePath);
        }

        PictureSize pictureSize = PictureSize.valueOf(metadata);
        Picture picture;
        if (pictureSize == null) {
            picture = new Picture(uniquePictureName, extractGpsData(metadata), extractCaptureDate(metadata));
        } else {
            picture = new Picture(uniquePictureName, extractGpsData(metadata), extractCaptureDate(metadata), pictureSize.getWidth(), pictureSize.getHeight());
        }

        stepController.addPicture(tripId, stepId, picture);

        return uniquePictureName;
    }

    public void delete(String tripId, String stepId, String pictureName) throws IOException, DisplayableException {
        StepDetail step = stepController.getStep(tripId, stepId);
        if (step == null) {
            throw new IllegalArgumentException("Given step could not be found!");
        }

        Path picturePath = getPicturePath(tripId, stepId, pictureName);
        if (!Files.exists(picturePath)) {
            throw new IllegalArgumentException("No such file " + picturePath.toString());
        }

        Files.delete(picturePath);

        stepController.deletePicture(tripId, stepId, pictureName);
    }

    private Path getPicturePath(String tripId, String stepId, String pictureName) {
        if (mediaPath.getString() == null) {
            throw new RuntimeException("triplog.media.path system property must be set!");
        }

        return Paths.get(mediaPath.getString(), tripId, stepId, pictureName);
    }

    private GpsPoint extractGpsData(Metadata metadata) {
        if (metadata != null) {
            GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDirectory != null) {
                GeoLocation geoLocation = gpsDirectory.getGeoLocation();
                return new GpsPoint(BigDecimal.valueOf(geoLocation.getLatitude()), BigDecimal.valueOf(geoLocation.getLongitude()));
            }
        }

        return null;
    }

    private LocalDateTime extractCaptureDate(Metadata metadata) {
        if (metadata != null) {
            ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifSubIFDDirectory != null) {
                Date captureDate = exifSubIFDDirectory.getDate(exifSubIFDDirectory.TAG_DATETIME_DIGITIZED);
                if (captureDate == null) {
                    captureDate = exifSubIFDDirectory.getDate(exifSubIFDDirectory.TAG_DATETIME_ORIGINAL);
                }
                if (captureDate == null) {
                    captureDate = exifSubIFDDirectory.getDate(exifSubIFDDirectory.TAG_DATETIME);
                }

                if (captureDate != null) {
                    return captureDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                }
            }
        }

        return LocalDateTime.now();
    }
}
