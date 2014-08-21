package ch.exq.triplog.server.core.util.misc;

import java.util.Date;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:42
 */
public class DateUtil {
    public static final Long SEC = 1000l;
    public static final Long MIN = 60 * SEC;
    public static final Long H = 60 * MIN;
    public static final Long DAY = 24 * H;

    public static Date now() {
        return new Date();
    }

    public static Date nowAdd(Long add) {
        return new Date(now().getTime() + add);
    }
}
