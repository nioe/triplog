package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;

import javax.ejb.Stateless;
import javax.inject.Inject;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 02.05.14
 * Time: 14:09
 */
@Stateless
public class ResourceController {

    private static final String PORT_DELIMITER = ":";
    private static final String PATH_DELIMITER = "/";
    private static final String TRIP_SERVICE_NAME = "trip";
    private static final String STEP_SERVICE_NAME = "step";
    private static final String IMAGE_SERVICE_NAME = "image";
    private static final String LOGIN_SERVICE_NAME = "login";

    @Inject
    @Config(key = "triplog.server.protocol", fallback = "http")
    SystemProperty protocol;

    @Inject
    @Config(key = "triplog.server.host", fallback = "localhost")
    SystemProperty hostName;

    @Inject
    @Config(key = "triplog.server.port", fallback = "8080")
    SystemProperty port;

    public String getStepUrl(String tripId, String stepId) {
        StringBuilder sb = new StringBuilder(getServerRoot());
        sb.append(PATH_DELIMITER).append(TRIP_SERVICE_NAME).append(PATH_DELIMITER).append(tripId);
        sb.append(PATH_DELIMITER).append(STEP_SERVICE_NAME).append(PATH_DELIMITER).append(stepId);

        return sb.toString();
    }

    public String getImageUrl(String imageId) {
        return getServerRoot() + PATH_DELIMITER + IMAGE_SERVICE_NAME + PATH_DELIMITER + imageId;
    }

    public String getServerRoot() {
        StringBuilder sb = new StringBuilder(protocol.getString());
        sb.append(PORT_DELIMITER).append(PATH_DELIMITER).append(PATH_DELIMITER);
        sb.append(hostName.getString()).append(PORT_DELIMITER).append(port.getString());

        return sb.toString();
    }

    public String getLoginUrl() {
        return getServerRoot() + PATH_DELIMITER + LOGIN_SERVICE_NAME;
    }
}
