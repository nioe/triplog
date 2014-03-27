package ch.exq.triplog.server.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
public class SystemPropertyUtil {
    private final static Logger logger = LoggerFactory.getLogger(SystemPropertyUtil.class);

    public static String getSystemProperty(String key, String fallback) {
        String value = System.getProperty(key);

        if (value == null) {
            logger.info("System property '" + key + "' not set. Fallback to '" + fallback + "'");
            value = fallback;
        }

        return value;
    }
}
