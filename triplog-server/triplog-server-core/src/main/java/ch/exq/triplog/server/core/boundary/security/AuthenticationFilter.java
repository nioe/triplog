package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.util.http.RemoteIpHelper;
import org.slf4j.Logger;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;
import java.io.IOException;

import static ch.exq.triplog.server.util.http.HttpHeader.X_AUTH_TOKEN;

@Provider
@AuthenticationRequired
public class AuthenticationFilter implements ContainerRequestFilter {

    private Logger logger;
    private AuthTokenHandler authTokenHandler;
    private ResponseController responseController;

    @Context
    HttpServletRequest request;

    public AuthenticationFilter() {}

    @Inject
    public AuthenticationFilter(Logger logger, AuthTokenHandler authTokenHandler, ResponseController responseController) {
        this.logger = logger;
        this.authTokenHandler = authTokenHandler;
        this.responseController = responseController;
    }

    @Override
    public void filter(ContainerRequestContext context) throws IOException {
        String authTokenId = request.getHeader(X_AUTH_TOKEN.key());

        try {
            authTokenHandler.updateValidTimeChecked(authTokenId);
        } catch (NotValidTokenException e) {
            logger.info("Blocked request to service {} from ip {} with auth token id {} - Invalid token",
                    request.getPathInfo(), RemoteIpHelper.getRemoteIpFrom(request), authTokenId);

            context.abortWith(responseController.unauthorized());
        }
    }
}
