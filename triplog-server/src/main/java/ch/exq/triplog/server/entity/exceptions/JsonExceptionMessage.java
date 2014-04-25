package ch.exq.triplog.server.entity.exceptions;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 12:34
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class JsonExceptionMessage {

    @XmlElement
    private final String message;

    public JsonExceptionMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
