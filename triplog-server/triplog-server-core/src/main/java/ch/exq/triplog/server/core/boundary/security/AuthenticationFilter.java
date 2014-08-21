package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.core.util.http.HttpHeader;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.util.http.RemoteIpHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    @Inject
    AuthTokenHandler authTokenHandler;

    @Inject
    ResponseController responseController;

    @Context
    HttpServletRequest request;

    @Override
    public void filter(ContainerRequestContext context) throws IOException {
        String authTokenId = request.getHeader(HttpHeader.X_AUTH_TOKEN.key());

        try {
            authTokenHandler.updateValidTime(authTokenId);
        } catch (NotValidTokenException e) {
            logger.info("Blocked request to service {} from ip {} with auth token id {} - Invalid token",
                    request.getPathInfo(), RemoteIpHelper.getRemoteIpFrom(request), authTokenId);

            context.abortWith(responseController.unauthorized());
        }
    }
}
