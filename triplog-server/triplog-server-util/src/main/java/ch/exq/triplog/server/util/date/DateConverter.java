package ch.exq.triplog.server.util.date;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 30.05.15
 * Time: 16:15
 */
public class DateConverter {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static LocalDate convertToDate(String dateString) {
        return dateString != null ? LocalDate.parse(dateString, FORMATTER) : null;
    }

    public static String convertToString(LocalDate date) {
        return date != null ? date.format(FORMATTER) : null;
    }
}
