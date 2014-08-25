package ch.exq.triplog.server.util.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 09:03
 */
public class SystemProperty {

    private static final Logger LOGGER = LoggerFactory.getLogger(SystemProperty.class);

    private String key;
    private String fallback;

    //Only used for tests!
    SystemProperty() {}

    public SystemProperty(Config config) {
        this.key = config.key();
        this.fallback = config.fallback();
    }

    public String getString() {
        String value = System.getProperty(key);

        if (value == null) {
            LOGGER.debug("System property '{}' not set. Fallback to '{}'", key, fallback);
            value = fallback;
        }

        return value;
    }

    public Integer getInteger() {
        return isNullOrEmpty() ? null : Integer.valueOf(getString());
    }

    public Long getLong() {
        return isNullOrEmpty() ? null : Long.valueOf(getString());
    }

    public boolean getBoolean() {
        return isNullOrEmpty() ? false : "true".equalsIgnoreCase(getString());
    }

    public boolean isNullOrEmpty() {
        return getString() == null || "".equals(getString());
    }
}
