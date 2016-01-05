package ch.exq.triplog.server.util.date;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateConverter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter JS_ISO_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

    public static LocalDate convertToDate(String dateString) {
        if (dateString == null) {
            return null;
        }

        try {
            return LocalDate.parse(dateString);
        } catch (DateTimeParseException ex) {
            return LocalDate.parse(dateString, JS_ISO_DATE_FORMATTER);
        }
    }

    public static LocalDateTime convertToDateTime(String dateString) {
        if (dateString == null) {
            return null;
        }

        try {
            return LocalDateTime.parse(dateString);
        } catch (DateTimeParseException ex) {
            return LocalDateTime.parse(dateString, JS_ISO_DATE_FORMATTER);
        }
    }

    public static String convertToString(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    public static String convertToString(LocalDateTime date) {
        return date != null ? date.format(DATE_TIME_FORMATTER) : null;
    }
}
