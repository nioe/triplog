package ch.exq.triplog.server.control.exceptions;

import javax.xml.bind.annotation.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 12:17
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class CreationException extends Exception {

    private final JsonExceptionMessage jsonExceptionMessage;

    public CreationException(String message) {
        super(message);
        this.jsonExceptionMessage = new JsonExceptionMessage(message);
    }

    public JsonExceptionMessage getJsonExceptionMessage() {
        return jsonExceptionMessage;
    }
}
