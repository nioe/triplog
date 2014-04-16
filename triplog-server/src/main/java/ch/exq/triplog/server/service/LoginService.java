package ch.exq.triplog.server.service;

import ch.exq.triplog.server.service.security.AdminAuthentication;
import ch.exq.triplog.server.service.security.AuthTokenHandler;
import ch.exq.triplog.server.service.security.AuthenticationRequired;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Base64;
import java.util.StringTokenizer;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 13:20
 */
@Path("/")
public class LoginService {

    private static final String HEADER_TOKEN = "X-AUTH-TOKEN";
    private static final String HEADER_AUTHORIZATION = "Authorization";
    private static final String AUTHENTICATION_TYPE = "Basic";

    @Inject
    private AdminAuthentication adminAuthentication;

    @Inject
    AuthTokenHandler authTokenHandler;

    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(@Context final HttpServletRequest request) {
        if (isValidLoginCredentials(request)) {
            return Response.ok(authTokenHandler.getNewToken()).build();
        } else {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }

    @POST
    @Path("/logout")
    @Produces(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response logout(@Context final HttpServletRequest request) {
        authTokenHandler.removeToken(request.getHeader(HEADER_TOKEN));

        return Response.ok().build();
    }

    private boolean isValidLoginCredentials(HttpServletRequest request) {
        String authHeader = request.getHeader(HEADER_AUTHORIZATION);

        if (authHeader == null || authHeader.isEmpty()) {
            return false;
        }

        authHeader = authHeader.replaceFirst(AUTHENTICATION_TYPE + " ", "");

        StringTokenizer tokenizer = new StringTokenizer(new String(Base64.getDecoder().decode(authHeader)), ":");
        if (tokenizer.countTokens() != 2) {
            return false;
        }

        String username = tokenizer.nextToken();
        String password = tokenizer.nextToken();

        if (!adminAuthentication.isValid(username, password)) {
            return false;
        }

        return true;
    }
}
