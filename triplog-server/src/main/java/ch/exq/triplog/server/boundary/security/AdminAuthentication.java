package ch.exq.triplog.server.boundary.security;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.http.HttpHeader;
import ch.exq.triplog.server.util.config.SystemProperty;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.util.Base64;
import java.util.StringTokenizer;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@RequestScoped
public class AdminAuthentication implements Serializable {

    @Inject
    @Config(key = "triplog.admin.user", fallback = "admin")
    SystemProperty adminUser;

    @Inject
    @Config(key = "triplog.admin.password", fallback = "password")
    SystemProperty adminPassword;

    public boolean isValid(String user, String password) {
        return adminUser.getString().equals(user) && adminPassword.getString().equals(password);
    }

    public boolean isValid(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeader.AUTHORIZATION.key());

        if (authHeader == null || authHeader.isEmpty()) {
            return false;
        }

        authHeader = authHeader.replaceFirst(HttpHeader.AUTHENTICATION_TYPE_BASIC.key() + " ", "");

        StringTokenizer tokenizer = new StringTokenizer(new String(Base64.getDecoder().decode(authHeader)), ":");
        if (tokenizer.countTokens() != 2) {
            return false;
        }

        String username = tokenizer.nextToken();
        String password = tokenizer.nextToken();

        return isValid(username, password);
    }
}
