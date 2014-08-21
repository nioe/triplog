package ch.exq.triplog.server.core.util.mongodb;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 16:55
 */
public class MongoDbUtil {
    private static final String MONGODB_ID_REGEX = "[a-f0-9]{24}";

    public static boolean isValidObjectId(String... ids) {
        for (String id : ids) {
            if (id == null || !id.matches(MONGODB_ID_REGEX)) {
                return false;
            }
        }

        return true;
    }
}
