package ch.exq.triplog.server.util;

import java.util.UUID;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 10:01
 */
public class UUIDUtil {

    public static String getRandomUUID() {
        return UUID.randomUUID().toString();
    }
}
