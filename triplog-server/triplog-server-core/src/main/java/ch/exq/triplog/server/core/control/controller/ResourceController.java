package ch.exq.triplog.server.core.control.controller;

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
    private static final String TRIP_SERVICE_NAME = "trips";
    private static final String STEP_SERVICE_NAME = "steps";
    private static final String PICTURE_SERVICE_NAME = "pictures";
    private static final String LOGIN_SERVICE_NAME = "login";

    @Inject
    @Config(key = "triplog.server.protocol", description = "The protocol which is used to access the TripLog services", fallback = "http")
    SystemProperty protocol;

    @Inject
    @Config(key = "triplog.server.host", description = "TripLog server's hostname", fallback = "localhost")
    SystemProperty hostName;

    @Inject
    @Config(key = "triplog.server.port", description = "Server port for TripLog services", fallback = "8080")
    SystemProperty port;

    @Inject
    @Config(key = "triplog.server.relative", description = "false: Use a absolute server path e.g. http://localhost:8080/trips, true: Use a relative service path e.g. /trips", fallback = "false")
    SystemProperty relative;

    public String getPictureUrl(String tripId, String stepId, String pictureName) {
        StringBuilder sb = new StringBuilder(getServerRoot());
        sb.append(PATH_DELIMITER).append(TRIP_SERVICE_NAME).append(PATH_DELIMITER).append(tripId);
        sb.append(PATH_DELIMITER).append(STEP_SERVICE_NAME).append(PATH_DELIMITER).append(stepId);
        sb.append(PATH_DELIMITER).append(PICTURE_SERVICE_NAME).append(PATH_DELIMITER).append(pictureName);

        return sb.toString();
    }

    public String getServerRoot() {
        StringBuilder sb = new StringBuilder();

        if (!relative.getBoolean()) {
            sb.append(protocol.getString());
            sb.append(PORT_DELIMITER).append(PATH_DELIMITER).append(PATH_DELIMITER);
            sb.append(hostName.getString()).append(PORT_DELIMITER).append(port.getString());
        }

        return sb.toString();
    }

    public String getLoginUrl() {
        return getServerRoot() + PATH_DELIMITER + LOGIN_SERVICE_NAME;
    }
}
