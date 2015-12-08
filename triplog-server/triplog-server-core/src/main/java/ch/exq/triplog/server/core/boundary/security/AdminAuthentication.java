package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import ch.exq.triplog.server.util.http.HttpHeader;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.util.Base64;
import java.util.StringTokenizer;

@RequestScoped
public class AdminAuthentication implements Serializable {

    private SystemProperty adminUser;
    private SystemProperty adminPassword;

    public AdminAuthentication() {}

    @Inject
    public AdminAuthentication(
            @Config(key = "triplog.admin.user", description = "The admin username which is used to add, delete or update content", fallback = "admin") SystemProperty adminUser,
            @Config(key = "triplog.admin.password", description = "The admin password which is used to add, delete or update content", fallback = "password") SystemProperty adminPassword
    ) {
        this.adminUser = adminUser;
        this.adminPassword = adminPassword;
    }

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
