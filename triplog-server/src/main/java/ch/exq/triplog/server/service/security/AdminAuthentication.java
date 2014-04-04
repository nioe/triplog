package ch.exq.triplog.server.service.security;

import ch.exq.triplog.server.util.Config;
import ch.exq.triplog.server.util.SystemProperty;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import java.io.Serializable;

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
        System.out.println(adminUser.getString() + " : " + adminPassword.getString());
        return adminUser.getString().equals(user) && adminPassword.getString().equals(password);
    }
}
