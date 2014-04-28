package ch.exq.triplog.server.control.exceptions;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 12:17
 */
public class DisplayableException extends Exception {

    private final JsonExceptionMessage jsonExceptionMessage;

    public DisplayableException(String message) {
        super(message);
        this.jsonExceptionMessage = new JsonExceptionMessage(message);
    }

    public DisplayableException(String message, Throwable cause) {
        super(message, cause);
        this.jsonExceptionMessage = new JsonExceptionMessage(message);
    }

    public JsonExceptionMessage getJsonExceptionMessage() {
        return jsonExceptionMessage;
    }
}
