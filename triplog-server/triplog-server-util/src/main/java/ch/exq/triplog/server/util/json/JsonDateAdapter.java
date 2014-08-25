package ch.exq.triplog.server.util.json;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 22.08.14
 * Time: 15:51
 */
public class JsonDateAdapter extends XmlAdapter<String, LocalDate> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public LocalDate unmarshal(String v) throws Exception {
        return LocalDate.parse(v, FORMATTER);
    }

    @Override
    public String marshal(LocalDate v) throws Exception {
        return v.format(FORMATTER);
    }
}
