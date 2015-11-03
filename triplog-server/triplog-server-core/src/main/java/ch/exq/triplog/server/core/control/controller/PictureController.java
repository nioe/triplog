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

public class PictureController {

    @Inject
    Logger logger;

    @Inject
    @Config(key = "triplog.media.path", description = "Path on server where pictures are stored")
    SystemProperty mediaPath;

    public File getPicture(String tripId, String stepId, String pictureName) {
        File picture = getPicturePath(tripId, stepId, pictureName).toFile();
        return picture.exists() ? picture : null;
    }

    public boolean savePicture(String tripId, String stepId, String pictureName, byte[] content) {
        try {
            Files.write(getPicturePath(tripId, stepId, pictureName), content, StandardOpenOption.CREATE_NEW);
            return true;
        } catch (IOException e) {
            logger.error("Could not save picture!", e);
            return false;
        }
    }

    private Path getPicturePath(String tripId, String stepId, String pictureName) {
        if (mediaPath.getString() == null) {
            throw new RuntimeException("triplog.media.path system property must be set!");
        }

        return Paths.get(mediaPath.getString(), tripId, stepId, pictureName);
    }
}
