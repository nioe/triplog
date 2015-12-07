package ch.exq.triplog.server.core.boundary.security;

import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

@Singleton
@Startup
public class DeadSessionRemover {

    private Logger logger;
    private AuthTokenHandler authTokenHandler;

    public DeadSessionRemover() {}

    @Inject
    public DeadSessionRemover(Logger logger, AuthTokenHandler authTokenHandler) {
        this.logger = logger;
        this.authTokenHandler = authTokenHandler;
    }

    @PostConstruct
    public void started() {
        logger.info("Started DeadSessionRemover");
    }

    @Schedule(hour = "*")
    public void removeDeadSessions() {
        synchronized (this) {
            logger.info("Removing dead sessions...");
            authTokenHandler.getTokens().forEach(tokenId -> authTokenHandler.isValidToken(tokenId));
            logger.info("Done.");
        }
    }
}
