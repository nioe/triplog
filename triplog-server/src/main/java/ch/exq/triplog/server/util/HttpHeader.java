package ch.exq.triplog.server.util;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 09:31
 */
public enum HttpHeader {
    AUTHORIZATION("Authorization"),
    AUTHENTICATION_TYPE_BASIC("Basic"),
    X_AUTH_TOKEN("X-AUTH-TOKEN"),
    WWW_Authenticate("WWW-Authenticate");

    private String key;

    private HttpHeader(String key) {
        this.key = key;
    }

    public String key() {
        return this.key;
    }
}
