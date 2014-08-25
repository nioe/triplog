package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.common.dto.AuthToken;
import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:28
 */
@ApplicationScoped
public class AuthTokenHandler {

    @Inject
    @Config(key = "triplog.session.timeout", description = "Session timeout in minutes", fallback = "1")
    SystemProperty sessionTimeout;

    @Inject
    Logger logger;

    private Map<String, AuthToken> authTokenMap;
    private Set<String> tokensToBeRemoved;

    @PostConstruct
    public void init() {
        this.authTokenMap = new HashMap<>();
        this.tokensToBeRemoved = new HashSet<>();
    }

    public AuthToken getNewToken() {
        AuthToken authToken = new AuthToken(LocalDateTime.now().plusMinutes(sessionTimeout.getLong()));
        authTokenMap.put(authToken.getId(), authToken);

        return authToken;
    }

    public boolean isValidToken(String tokenId) {
        if (tokenId == null || tokenId.isEmpty()) {
            return false;
        }

        AuthToken authToken = authTokenMap.get(tokenId);
        if (authToken == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(authToken.getExpiryDate())) {
            removeToken(tokenId);
            return false;
        }

        return true;
    }

    public AuthToken updateValidTime(String tokenId) throws NotValidTokenException {
        if (!isValidToken(tokenId)) {
            throw new NotValidTokenException();
        }

        AuthToken authToken = authTokenMap.get(tokenId);
        authToken.setExpiryDate(LocalDateTime.now().plusMinutes(sessionTimeout.getLong()));

        return authToken;
    }

    public void removeToken(String tokenId) {
        logger.info("Removed tokenId {}", tokenId);
        authTokenMap.remove(tokenId);
    }

    Set<String> getTokens() {
        return new HashSet<>(authTokenMap.keySet());
    }
}
