package ch.exq.triplog.server.util;

import ch.exq.triplog.server.entity.exceptions.CreationException;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 10:34
 */
public class ResponseHelper {

    public static Response badRequest(CreationException ex) {
        return Response.status(Response.Status.BAD_REQUEST).entity(ex.getJsonExceptionMessage()).build();
    }

    public static Response unauthorized(HttpServletRequest request) {
        return Response.status(Response.Status.UNAUTHORIZED)
                .header(HttpHeader.WWW_Authenticate.key(),  buildWwwAuthenticateHeader(request))
                .build();
    }

    private static String buildWwwAuthenticateHeader(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder(HttpHeader.AUTHENTICATION_TYPE_BASIC.key());
        sb.append(" realm=\"").append(request.getServerName()).append(":").append(request.getServerPort())
                .append("/login\"");

        return  sb.toString();
    }
}
