package ch.exq.triplog.server.boundary.service;

import ch.exq.triplog.server.boundary.security.AdminAuthentication;
import ch.exq.triplog.server.boundary.security.AuthTokenHandler;
import ch.exq.triplog.server.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.util.HttpHeader;
import ch.exq.triplog.server.util.ResponseHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private static final Logger logger = LoggerFactory.getLogger(LoginService.class);

    @Inject
    private AdminAuthentication adminAuthentication;

    @Inject
    AuthTokenHandler authTokenHandler;

    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(@Context final HttpServletRequest request) {
        if (adminAuthentication.isValid(request)) {
            logger.info("Successful admin login");
            return Response.ok(authTokenHandler.getNewToken()).build();
        } else {
            logger.info("Admin login failed");
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
