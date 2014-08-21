package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.core.dto.AuthToken;
import ch.exq.triplog.server.core.util.config.Hardcoded;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDateTime;

import static org.junit.Assert.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:49
 */
public class AuthTokenHandlerTest {

    private AuthTokenHandler authTokenHandler;

    @Before
    public void setUp() {
        this.authTokenHandler = new AuthTokenHandler();
        this.authTokenHandler.init();
    }

    @Test
    public void testGetNewToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("60");
        LocalDateTime now = LocalDateTime.now();
        AuthToken authToken = authTokenHandler.getNewToken();

        assertNotNull(authToken);
        assertNotNull(authToken.getId());
        assertNotNull(authToken.getExpiryDate());
        assertTrue(now.isBefore(authToken.getExpiryDate()));

        assertTrue(now.plusMinutes(60).isBefore(authToken.getExpiryDate()));
        assertTrue(LocalDateTime.now().plusMinutes(60).isAfter(authToken.getExpiryDate()));
    }

    @Test
    public void testIsValid_ValidToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("60");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertTrue(authTokenHandler.isValidToken(authToken.getId()));
    }

    @Test
    public void testIsValid_ExpiredToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("-60");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertFalse(authTokenHandler.isValidToken(authToken.getId()));
    }

    @Test
    public void testIsValid_EmptyToken() {
        assertFalse(authTokenHandler.isValidToken(""));
    }

    @Test
    public void testIsValid_NullToken() {
        assertFalse(authTokenHandler.isValidToken(null));
    }

    @Test
    public void testRemoveToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("10000");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertTrue(authTokenHandler.isValidToken(authToken.getId()));
        authTokenHandler.removeToken(authToken.getId());
        assertFalse(authTokenHandler.isValidToken(authToken.getId()));
    }
}
