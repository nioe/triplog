package ch.exq.triplog.server.service.security;

import ch.exq.triplog.server.service.dto.AuthToken;
import ch.exq.triplog.server.util.Config;
import ch.exq.triplog.server.util.DateUtil;
import ch.exq.triplog.server.util.SystemProperty;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
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
    @Config(key = "triplog.session.timeout", fallback = "3600000") //1h
    SystemProperty sessionTimeout;

    private Map<String, AuthToken> authTokenMap;

    @PostConstruct
    public void init() {
        this.authTokenMap = new HashMap<>();
    }

    public AuthToken getNewToken() {
        AuthToken authToken = new AuthToken(DateUtil.nowAdd(sessionTimeout.getLong()));
        authTokenMap.put(authToken.getId(), authToken);

        return authToken;
    }

    public boolean isValidToken(String tokenId) {
        AuthToken authToken = authTokenMap.get(tokenId);
        return authToken != null ? DateUtil.now().getTime() <= authToken.getExpiryDate().getTime() : false;
    }

    public void removeToken(String tokenId) {
        authTokenMap.remove(tokenId);
    }
}
