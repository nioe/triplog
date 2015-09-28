package ch.exq.triplog.server.util.id;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 15:50
 */
public class IdGenerator {

    private static final String SEPARATOR = "-";

    private static final List<Character> charsToReplace = new ArrayList<>();

    static {
        charsToReplace.add(' ');
        charsToReplace.add('\'');
        charsToReplace.add('\"');
        charsToReplace.add('\n');
        charsToReplace.add('>');
        charsToReplace.add('<');
    }

    public static String generateIdWithFullDate(String name, LocalDate date) {
        return generateIdBy(name, date, true);
    }

    public static String generateIdWithYear(String name, LocalDate date) {
        return generateIdBy(name, date, false);
    }

    private static String generateIdBy(String name, LocalDate date, boolean fullDate) {
        StringBuilder newName = new StringBuilder(deAccent(replaceChars(name)).toLowerCase());

        if (fullDate) {
            newName.append(SEPARATOR).append(convertToString(date));
        } else {
            newName.append(SEPARATOR).append(date.getYear());
        }

        return newName.toString();
    }

    private static String deAccent(String str) {
        String nfdNormalizedString = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

        return pattern.matcher(nfdNormalizedString).replaceAll("");
    }

    private static String replaceChars(String name) {
        String sanitizedName = name;
        for (Character character : charsToReplace) {
            sanitizedName = sanitizedName.replace(character.toString(), SEPARATOR);
        }

        return sanitizedName;
    }
}
