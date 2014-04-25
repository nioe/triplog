package ch.exq.triplog.server.boundary.security;

import ch.exq.triplog.server.util.http.HttpHeader;
import ch.exq.triplog.server.util.http.ResponseHelper;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;
import java.io.IOException;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@Provider
@AuthenticationRequired
public class AuthenticationFilter implements ContainerRequestFilter {

    @Inject
    private AuthTokenHandler authTokenHandler;

    @Context
    private HttpServletRequest request;

    @Override
    public void filter(ContainerRequestContext context) throws IOException {
        String authTokenId = request.getHeader(HttpHeader.X_AUTH_TOKEN.key());

        if (!authTokenHandler.isValidToken(authTokenId)) {
            context.abortWith(ResponseHelper.unauthorized(request));
        }
    }
}
