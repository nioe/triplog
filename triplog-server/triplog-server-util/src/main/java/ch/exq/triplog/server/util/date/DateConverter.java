package ch.exq.triplog.server.util.date;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateConverter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public static LocalDate convertToDate(String dateString) {
        return dateString != null ? LocalDate.parse(dateString, DATE_FORMATTER) : null;
    }

    public static LocalDateTime convertToDateTime(String dateString) {
        return dateString != null ? LocalDateTime.parse(dateString, DATE_TIME_FORMATTER) : null;
    }

    public static String convertToString(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    public static String convertToString(LocalDateTime date) {
        return date != null ? date.format(DATE_TIME_FORMATTER) : null;
    }
}
