package ch.exq.triplog.server.core.entity.dao;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;

import javax.inject.Inject;
import java.io.IOException;
import java.nio.file.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 21.11.15
 * Time: 14:32
 */
public class PictureDAO {

    private Path mediaPath;

    @Inject
    public PictureDAO(@Config(key = "triplog.media.path", description = "Path on server where pictures are stored") final SystemProperty mediaPathProperty) {
        if (mediaPathProperty.getString() == null) {
            throw new RuntimeException("triplog.media.path system property must be set!");
        }

        this.mediaPath = Paths.get(mediaPathProperty.getString());
    }

    public Path getPicturePath(String tripId, String stepId, String pictureName) {
        return mediaPath.resolve(tripId).resolve(stepId).resolve(pictureName);
    }

    public Path savePicture(String tripId, String stepId, String pictureName, byte[] content) throws IOException {
        Path picturePath = getPicturePath(tripId, stepId, pictureName);
        Files.createDirectories(picturePath.getParent());
        Files.write(picturePath, content, StandardOpenOption.CREATE_NEW);

        return picturePath;
    }

    public void deletePicture(String tripId, String stepId, String pictureName) throws IOException {
        final Path picturePath = getPicturePath(tripId, stepId, pictureName);
        if (!Files.exists(picturePath)) {
            throw new IllegalArgumentException("No such file " + picturePath.toString());
        }

        Path currentPath = picturePath;
        while (!currentPath.equals(mediaPath)) {
            try {
                Files.delete(currentPath);
                currentPath = currentPath.getParent();
            } catch (DirectoryNotEmptyException e) {
                break;
            }
        }
    }
}
