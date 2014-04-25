package ch.exq.triplog.server.service.security;

import ch.exq.triplog.server.service.dto.AuthToken;
import ch.exq.triplog.server.util.DateUtil;
import ch.exq.triplog.server.util.Hardcoded;
import org.junit.Before;
import org.junit.Test;

import java.util.Date;

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
        authTokenHandler.sessionTimeout = Hardcoded.configuration("10000");
        Date now = DateUtil.now();
        AuthToken authToken = authTokenHandler.getNewToken();

        assertNotNull(authToken);
        assertNotNull(authToken.getId());
        assertNotNull(authToken.getExpiryDate());
        assertTrue(now.getTime() < authToken.getExpiryDate().getTime());

        assertEquals((now.getTime() + 10000)/1000, authToken.getExpiryDate().getTime()/1000);
    }

    @Test
    public void testIsValid_ValidToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("10000");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertTrue(authTokenHandler.isValidToken(authToken.getId()));
    }

    @Test
    public void testIsValid_ExpiredToken() {
        authTokenHandler.sessionTimeout = Hardcoded.configuration("-10000");
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
