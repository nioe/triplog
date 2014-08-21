package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.core.dto.AuthToken;
import ch.exq.triplog.server.core.util.config.Config;
import ch.exq.triplog.server.core.util.config.SystemProperty;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:28
 */
@ApplicationScoped
public class AuthTokenHandler {

    @Inject
    @Config(key = "triplog.session.timeout", description = "Session timeout in minutes", fallback = "60")
    SystemProperty sessionTimeout;

    private Map<String, AuthToken> authTokenMap;

    @PostConstruct
    public void init() {
        this.authTokenMap = new HashMap<>();
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
        authTokenMap.remove(tokenId);
    }
}
