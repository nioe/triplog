package ch.exq.triplog.server.core.util.http;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 09:31
 */
public enum HttpHeader {
    AUTHORIZATION("Authorization"),
    AUTHENTICATION_TYPE_BASIC("Basic"),
    X_AUTH_TOKEN("X-AUTH-TOKEN"),
    WWW_Authenticate("WWW-Authenticate"),
    X_FORWARDED_FOR("X-Forwarded-For"),
    PROXY_CLIENT_IP("Proxy-Client-IP"),
    WL_PROXY_CLIENT_IP("WL-Proxy-Client-IP"),
    HTTP_CLIENT_IP("HTTP_CLIENT_IP"),
    HTTP_X_FORWARDED_FOR("HTTP_X_FORWARDED_FOR");

    private String key;

    private HttpHeader(String key) {
        this.key = key;
    }

    public String key() {
        return this.key;
    }
}
