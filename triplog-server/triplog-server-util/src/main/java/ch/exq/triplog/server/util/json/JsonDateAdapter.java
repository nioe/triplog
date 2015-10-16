package ch.exq.triplog.server.util.json;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.time.LocalDate;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDate;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 22.08.14
 * Time: 15:51
 */
public class JsonDateAdapter extends XmlAdapter<String, LocalDate> {

    @Override
    public LocalDate unmarshal(String v) throws Exception {
        return convertToDate(v);
    }

    @Override
    public String marshal(LocalDate v) throws Exception {
        return convertToString(v);
    }
}
