package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

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

    public String savePicture(String tripId, String stepId, String pictureName, byte[] content) throws IOException {
        if (stepController.getStep(tripId, stepId) == null) {
            throw new IllegalArgumentException("Given step could not be found!");
        }

        String pictureExtension = pictureName.substring(pictureName.lastIndexOf('.'));
        String uniquePictureName = getRandomUUID() + pictureExtension;

        Path picturePath = getPicturePath(tripId, stepId, uniquePictureName);
        Files.createDirectories(picturePath.getParent());
        Files.write(picturePath, content, StandardOpenOption.CREATE_NEW);

        return uniquePictureName;
    }

    public void delete(String tripId, String stepId, String pictureName) throws IOException {
        if (stepController.getStep(tripId, stepId) == null) {
            throw new IllegalArgumentException("Given step could not be found!");
        }

        Path picturePath = getPicturePath(tripId, stepId, pictureName);
        if (!Files.exists(picturePath)) {
            throw new IllegalArgumentException("No such file " + picturePath.toString());
        }

        Files.delete(picturePath);
    }

    private Path getPicturePath(String tripId, String stepId, String pictureName) {
        if (mediaPath.getString() == null) {
            throw new RuntimeException("triplog.media.path system property must be set!");
        }

        return Paths.get(mediaPath.getString(), tripId, stepId, pictureName);
    }
}
