package ch.exq.triplog.server.util.id;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 15:50
 */
public class IdGenerator {

    private static final String SEPARATOR = "-";

    private static final Map<Character, String> charsToReplace = new HashMap<>();

    static {
        charsToReplace.put(' ', SEPARATOR);
        charsToReplace.put('\'', SEPARATOR);
        charsToReplace.put('\"', SEPARATOR);
        charsToReplace.put('\n', SEPARATOR);
        charsToReplace.put('>', SEPARATOR);
        charsToReplace.put('<', SEPARATOR);
        charsToReplace.put('&', SEPARATOR);
        charsToReplace.put('=', SEPARATOR);
        charsToReplace.put('?', SEPARATOR);
        charsToReplace.put('#', SEPARATOR);
        charsToReplace.put('/', SEPARATOR);
        charsToReplace.put('ø', "o");
    }

    public static String generateIdWithFullDate(final String name, final LocalDate date) {
        return generateIdBy(name, date, true);
    }

    public static String generateIdWithYear(final String name, final LocalDate date) {
        return generateIdBy(name, date, false);
    }

    private static String generateIdBy(final String name, final LocalDate date, final boolean fullDate) {
        StringBuilder newName = new StringBuilder(deAccent(replaceChars(name.toLowerCase())));

        if (fullDate) {
            newName.append(SEPARATOR).append(convertToString(date));
        } else {
            newName.append(SEPARATOR).append(date.getYear());
        }

        return replaceMultipleSeparator(newName.toString());
    }

    private static String deAccent(final String name) {
        String nfdNormalizedString = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

        return pattern.matcher(nfdNormalizedString).replaceAll("");
    }

    private static String replaceChars(final String name) {
        String sanitizedName = name;

        for (Map.Entry<Character, String> entry : charsToReplace.entrySet()) {
            sanitizedName = sanitizedName.replace(entry.getKey().toString(), entry.getValue());
        }

        return sanitizedName;
    }

    private static String replaceMultipleSeparator(final String name) {
        return name.replaceAll("(" + SEPARATOR + ")+", SEPARATOR);
    }
}
