package ch.exq.triplog.server.util.id;

import java.time.LocalDate;

import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 15:50
 */
public class IdGenerator {

    private static final String SEPARATOR = "-";

    public static String generateIdWithFullDate(String name, LocalDate date) {
        return generateIdBy(name, date, true);
    }

    public static String generateIdWithYear(String name, LocalDate date) {
        return generateIdBy(name, date, false);
    }

    private static String generateIdBy(String name, LocalDate date, boolean fullDate) {
        StringBuilder newName = new StringBuilder(replaceSpaces(name).toLowerCase());

        if (fullDate) {
            newName.append(SEPARATOR).append(convertToString(date));
        } else {
            newName.append(SEPARATOR).append(date.getYear());
        }

        return newName.toString();
    }

    private static String replaceSpaces(String name) {
        return name.replace(" ", SEPARATOR);
    }
}
