package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.core.control.exceptions.DisplayableException;

import javax.inject.Inject;
import javax.ws.rs.core.Response;

import static ch.exq.triplog.server.util.http.HttpHeader.AUTHENTICATION_TYPE_BASIC;
import static ch.exq.triplog.server.util.http.HttpHeader.WWW_Authenticate;
import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static javax.ws.rs.core.Response.Status.UNAUTHORIZED;

public class ResponseController {

    private ResourceController resourceController;

    @Inject
    public ResponseController(ResourceController resourceController) {
        this.resourceController = resourceController;
    }

    public Response badRequest(DisplayableException ex) {
        return Response.status(BAD_REQUEST).entity(ex.getJsonExceptionMessage()).build();
    }

    public Response unauthorized() {
        return Response.status(UNAUTHORIZED)
                .header(WWW_Authenticate.key(), buildWwwAuthenticateHeader())
                .build();
    }

    private String buildWwwAuthenticateHeader() {
        StringBuilder sb = new StringBuilder();
        sb.append("x").append(AUTHENTICATION_TYPE_BASIC.key());
        sb.append(" realm=\"").append(resourceController.getLoginUrl()).append("\"");

        return  sb.toString();
    }
}
