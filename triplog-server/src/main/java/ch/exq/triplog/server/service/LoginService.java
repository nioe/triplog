package ch.exq.triplog.server.service;

import ch.exq.triplog.server.service.security.AdminAuthentication;
import ch.exq.triplog.server.service.security.AuthTokenHandler;
import ch.exq.triplog.server.service.security.AuthenticationRequired;
import ch.exq.triplog.server.util.HttpHeader;
import ch.exq.triplog.server.util.ResponseHelper;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 13:20
 */
@Path("/")
public class LoginService {

    @Inject
    private AdminAuthentication adminAuthentication;

    @Inject
    AuthTokenHandler authTokenHandler;

    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(@Context final HttpServletRequest request) {
        if (adminAuthentication.isValid(request)) {
            return Response.ok(authTokenHandler.getNewToken()).build();
        } else {
            return ResponseHelper.unauthorized(request);
        }
    }

    @POST
    @Path("/logout")
    @Produces(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response logout(@Context final HttpServletRequest request) {
        authTokenHandler.removeToken(request.getHeader(HttpHeader.X_AUTH_TOKEN.key()));

        return Response.ok().build();
    }
}
