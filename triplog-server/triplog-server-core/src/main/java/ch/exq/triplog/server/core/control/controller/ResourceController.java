package ch.exq.triplog.server.core.control.controller;

import javax.ejb.Stateless;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 02.05.14
 * Time: 14:09
 */
@Stateless
public class ResourceController {

    private static final String PATH_DELIMITER = "/";
    private static final String TRIP_SERVICE_NAME = "trips";
    private static final String STEP_SERVICE_NAME = "steps";
    private static final String PICTURE_SERVICE_NAME = "pictures";
    private static final String LOGIN_SERVICE_NAME = "login";

    public String getPictureUrl(String tripId, String stepId, String pictureName) {
        StringBuilder sb = new StringBuilder()
                .append(TRIP_SERVICE_NAME).append(PATH_DELIMITER).append(tripId)
                .append(PATH_DELIMITER).append(STEP_SERVICE_NAME).append(PATH_DELIMITER).append(stepId)
                .append(PATH_DELIMITER).append(PICTURE_SERVICE_NAME).append(PATH_DELIMITER).append(pictureName);

        return sb.toString();
    }

    public String getLoginUrl() {
        return LOGIN_SERVICE_NAME;
    }
}
