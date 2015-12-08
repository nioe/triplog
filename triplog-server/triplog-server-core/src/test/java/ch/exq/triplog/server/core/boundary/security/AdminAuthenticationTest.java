package ch.exq.triplog.server.core.boundary.security;

import org.junit.Test;

import static ch.exq.triplog.server.util.config.Hardcoded.configuration;
import static org.assertj.core.api.Assertions.assertThat;

public class AdminAuthenticationTest {
    private static final String CORRECT_USER = "admin";
    private static final String CORRECT_PASSWORD = "password";
    private static final String WRONG_USER = "foo";
    private static final String WRONG_PASSWORD = "bar";

    private AdminAuthentication adminAuthentication = new AdminAuthentication(configuration(CORRECT_USER), configuration(CORRECT_PASSWORD));;

    @Test
    public void should_return_true_if_correct_user_and_password_are_given() throws Exception {
        assertThat(adminAuthentication.isValid(CORRECT_USER, CORRECT_PASSWORD)).isTrue();
    }

    @Test
    public void should_return_false_if_wrong_user_is_given() throws Exception {
        assertThat(adminAuthentication.isValid(WRONG_USER, CORRECT_PASSWORD)).isFalse();
    }

    @Test
    public void should_return_false_if_wrong_password_is_given() throws Exception {
        assertThat(adminAuthentication.isValid(CORRECT_USER, WRONG_PASSWORD)).isFalse();
    }

    @Test
    public void should_return_false_if_wrong_user_and_password_are_given() throws Exception {
        assertThat(adminAuthentication.isValid(WRONG_USER, WRONG_PASSWORD)).isFalse();
    }
}
