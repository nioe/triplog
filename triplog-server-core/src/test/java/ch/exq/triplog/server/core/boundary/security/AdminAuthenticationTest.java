package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.util.config.Hardcoded;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
public class AdminAuthenticationTest {
    private static final String CORRECT_USER = "admin";
    private static final String CORRECT_PASSWORD = "password";
    private static final String WRONG_USER = "foo";
    private static final String WRONG_PASSWORD = "bar";

    private AdminAuthentication toTest;

    @Before
    public void setUp() {
        toTest = new AdminAuthentication();
        Hardcoded.enableDefaults(toTest);
    }

    @Test
    public void testIsValidCorrect() throws Exception {
        assertTrue(toTest.isValid(CORRECT_USER, CORRECT_PASSWORD));
    }

    @Test
    public void testIsValidWrongUser() throws Exception {
        assertFalse(toTest.isValid(WRONG_USER, CORRECT_PASSWORD));
    }

    @Test
    public void testIsValidWrongPassword() throws Exception {
        assertFalse(toTest.isValid(CORRECT_USER, WRONG_PASSWORD));
    }

    @Test
    public void testIsValidWrongUserAndPassowrd() throws Exception {
        assertFalse(toTest.isValid(WRONG_USER, WRONG_PASSWORD));
    }
}
