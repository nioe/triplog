package ch.exq.triplog.server.core.boundary.security;

import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 22.08.14
 * Time: 16:27
 */
@Singleton
@Startup
public class DeadSessionRemover {

    @Inject
    Logger logger;

    @Inject
    AuthTokenHandler authTokenHandler;

    @PostConstruct
    public void started() {
        logger.info("Started DeadSessionRemover");
    }

    @Schedule(minute = "*", hour = "*")
    public void removeDeadSessions() {
        synchronized (this) {
            logger.info("Removing dead sessions...");
            authTokenHandler.getTokens().forEach(tokenId -> authTokenHandler.isValidToken(tokenId));
            logger.info("Done.");
        }
    }
}
