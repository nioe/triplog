package ch.exq.triplog.server.service.security;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.Base64;
import java.util.StringTokenizer;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@Provider
@AuthenticationRequired
public class AuthenticationFilter implements ContainerRequestFilter {

    private static final Response FORBIDDEN = Response.status(Response.Status.FORBIDDEN).build();
    public static final String AUTHENTICATION_TYPE = "Basic";

    @Inject
    private AdminAuthentication adminAuthentication;

    @Context
    private HttpServletRequest request;

    @Override
    public void filter(ContainerRequestContext context) throws IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || authHeader.isEmpty()) {
            context.abortWith(FORBIDDEN);
        }

        authHeader = authHeader.replaceFirst(AUTHENTICATION_TYPE + " ", "");

        StringTokenizer tokenizer = new StringTokenizer(new String(Base64.getDecoder().decode(authHeader)), ":");
        if (tokenizer.countTokens() != 2) {
            context.abortWith(FORBIDDEN);
        }

        String username = tokenizer.nextToken();
        String password = tokenizer.nextToken();

        if (!adminAuthentication.isValid(username, password)) {
            context.abortWith(FORBIDDEN);
        }
    }
}
