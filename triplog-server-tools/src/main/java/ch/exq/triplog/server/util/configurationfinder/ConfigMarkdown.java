package ch.exq.triplog.server.util.configurationfinder;

import ch.exq.triplog.server.util.config.Config;

import java.util.Set;
import java.util.TreeSet;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 21.08.14
 * Time: 14:46
 */
public class ConfigMarkdown {

    static final String KEY_COLUMN_TITLE = "Key";
    static final String DESCRIPTION_COLUMN_TITLE = "Description";
    static final String FALLBACK_COLUMN_TITLE = "Default Value";
    static final String COLUMN_SEPARATOR = "|";
    static final String ROW_SEPARATOR = "\n";
    static final String LINE = "---";

    private Set<ConfigMarkdownLine> lines;

    public ConfigMarkdown(Set<Config> configs) {
        lines = new TreeSet<>();
        configs.forEach(config -> lines.add(new ConfigMarkdownLine(config)));
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(COLUMN_SEPARATOR).append(KEY_COLUMN_TITLE).append(COLUMN_SEPARATOR)
                .append(DESCRIPTION_COLUMN_TITLE).append(COLUMN_SEPARATOR)
                .append(FALLBACK_COLUMN_TITLE).append(COLUMN_SEPARATOR)
                .append(ROW_SEPARATOR)
                .append(COLUMN_SEPARATOR).append(LINE).append(COLUMN_SEPARATOR).append(LINE)
                .append(COLUMN_SEPARATOR).append(LINE).append(COLUMN_SEPARATOR);

        lines.forEach(line -> sb.append(line));

        return sb.toString();
    }
}
