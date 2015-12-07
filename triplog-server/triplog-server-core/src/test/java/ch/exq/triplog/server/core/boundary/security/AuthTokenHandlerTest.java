package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.common.dto.AuthToken;
import ch.exq.triplog.server.util.config.Hardcoded;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

import static java.time.LocalDateTime.now;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:49
 */
public class AuthTokenHandlerTest {

    @Test
    public void should_create_new_token_with_correct_expiry_date() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("60");

        LocalDateTime testStartTime = now();
        AuthToken authToken = authTokenHandler.getNewToken();

        assertThat(authToken).isNotNull();
        assertThat(authToken.getId()).isNotNull();
        assertThat(authToken.getExpiryDate()).isAfterOrEqualTo(testStartTime.plusMinutes(60));
        assertThat(authToken.getExpiryDate()).isBeforeOrEqualTo(now().plusMinutes(60));
    }

    @Test
    public void should_create_new_token_which_is_valid_now() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("60");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertThat(authTokenHandler.isValidToken(authToken.getId())).isTrue();
    }

    @Test
    public void should_create_new_token_which_is_invalid_now() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("-60");
        AuthToken authToken = authTokenHandler.getNewToken();

        assertThat(authTokenHandler.isValidToken(authToken.getId())).isFalse();
    }

    @Test
    public void should_return_false_for_empty_string() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("60");

        assertThat(authTokenHandler.isValidToken("")).isFalse();
    }

    @Test
    public void should_return_false_for_null() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("60");

        assertThat(authTokenHandler.isValidToken(null)).isFalse();
    }

    @Test
    public void should_remove_token() {
        AuthTokenHandler authTokenHandler = createAuthTokenHandler("10000");

        AuthToken authToken = authTokenHandler.getNewToken();

        assertThat(authTokenHandler.isValidToken(authToken.getId())).isTrue();
        authTokenHandler.removeToken(authToken.getId());
        assertThat(authTokenHandler.isValidToken(authToken.getId())).isFalse();
    }

    private AuthTokenHandler createAuthTokenHandler(String timeout) {
        return new AuthTokenHandler(Hardcoded.configuration(timeout), LoggerFactory.getLogger(AuthTokenHandler.class));
    }
}
