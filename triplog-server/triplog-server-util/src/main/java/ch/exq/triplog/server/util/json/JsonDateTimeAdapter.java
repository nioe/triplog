package ch.exq.triplog.server.util.json;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.time.LocalDateTime;

import static ch.exq.triplog.server.util.date.DateConverter.convertToDateTime;
import static ch.exq.triplog.server.util.date.DateConverter.convertToString;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 22.08.14
 * Time: 15:51
 */
public class JsonDateTimeAdapter extends XmlAdapter<String, LocalDateTime> {

    @Override
    public LocalDateTime unmarshal(String v) throws Exception {
        return convertToDateTime(v);
    }

    @Override
    public String marshal(LocalDateTime v) throws Exception {
        return convertToString(v);
    }
}
