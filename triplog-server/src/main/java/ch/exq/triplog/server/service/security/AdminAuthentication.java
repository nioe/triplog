package ch.exq.triplog.server.service.security;

import ch.exq.triplog.server.util.SystemPropertyUtil;

import javax.enterprise.context.RequestScoped;
import java.io.Serializable;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@RequestScoped
public class AdminAuthentication implements Serializable {
    private static final String SYSTEM_PROPERTY_ADMIN_USER = "triplog.admin.user";
    private static final String SYSTEM_PROPERTY_ADMIN_PASSWORD = "triplog.admin.password";
    private static final String DEFAULT_ADMIN_USER = "admin";
    private static final String DEFALUT_ADMIN_PASSWORD = "password";

    public boolean isValid(String user, String password) {
        return getAdminUser().equals(user) && getAdminPassword().equals(password);
    }

    private String getAdminUser() {
        return SystemPropertyUtil.getSystemProperty(SYSTEM_PROPERTY_ADMIN_USER, DEFAULT_ADMIN_USER);
    }

    private String getAdminPassword() {
        return SystemPropertyUtil.getSystemProperty(SYSTEM_PROPERTY_ADMIN_PASSWORD, DEFALUT_ADMIN_PASSWORD);
    }
}
