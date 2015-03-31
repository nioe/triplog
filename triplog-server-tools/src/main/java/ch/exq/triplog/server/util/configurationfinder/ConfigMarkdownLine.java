package ch.exq.triplog.server.util.configurationfinder;

import ch.exq.triplog.server.util.config.Config;

import static ch.exq.triplog.server.util.configurationfinder.ConfigMarkdown.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 21.08.14
 * Time: 14:47
 */
public class ConfigMarkdownLine implements Comparable<ConfigMarkdownLine> {
    public static final String NOT_SET_PLACE_HOLDER = "-";

    private Config config;

    public ConfigMarkdownLine(Config config) {
        this.config = config;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ROW_SEPARATOR)
                .append(COLUMN_SEPARATOR).append(config.key())
                .append(COLUMN_SEPARATOR).append(descriptionIsSet() ? config.description() : NOT_SET_PLACE_HOLDER)
                .append(COLUMN_SEPARATOR).append(fallbackIsSet() ? config.fallback() : NOT_SET_PLACE_HOLDER)
                .append(COLUMN_SEPARATOR);

        return sb.toString();
    }

    private boolean fallbackIsSet() {
        return config.fallback() != null && !config.fallback().equals("");
    }

    private boolean descriptionIsSet() {
        return config.description() != null && !config.description().equals("");
    }

    @Override
    public int compareTo(ConfigMarkdownLine o) {
        return this.config.key().compareTo(o.config.key());
    }
}
