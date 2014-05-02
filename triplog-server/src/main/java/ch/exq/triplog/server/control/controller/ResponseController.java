package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.control.exceptions.DisplayableException;
import ch.exq.triplog.server.util.http.HttpHeader;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.core.Response;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 10:34
 */
@Stateless
public class ResponseController {

    @Inject
    ResourceController resourceController;

    public Response badRequest(DisplayableException ex) {
        return Response.status(Response.Status.BAD_REQUEST).entity(ex.getJsonExceptionMessage()).build();
    }

    public Response unauthorized() {
        return Response.status(Response.Status.UNAUTHORIZED)
                .header(HttpHeader.WWW_Authenticate.key(), buildWwwAuthenticateHeader())
                .build();
    }

    private String buildWwwAuthenticateHeader() {
        StringBuilder sb = new StringBuilder(HttpHeader.AUTHENTICATION_TYPE_BASIC.key());
        sb.append(" realm=\"").append(resourceController.getLoginUrl()).append("\"");

        return  sb.toString();
    }
}
