package ch.exq.triplog.server.entity.db;

import ch.exq.triplog.server.util.Config;
import ch.exq.triplog.server.util.SystemProperty;
import com.mongodb.DB;
import com.mongodb.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import java.net.UnknownHostException;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 10:23
 */
@RequestScoped
public class TriplogDb {

    private final static Logger logger = LoggerFactory.getLogger(TriplogDb.class);

    @Inject
    @Config(key = "triplog.mongodb.host", fallback = "localhost")
    SystemProperty host;

    @Inject
    @Config(key = "triplog.mongodb.port", fallback = "27017")
    SystemProperty port;

    @Inject
    @Config(key = "triplog.mongodb.dbname", fallback = "triplog")
    SystemProperty dbName;

    private MongoClient monngoClient;
    private DB db;

    @PostConstruct
    public void init() {
        try {
            monngoClient = new MongoClient(host.getString(), port.getInteger());
            db = monngoClient.getDB(dbName.getString());
        } catch (UnknownHostException e) {
            logger.error("DB Connection could not be established!", e);
        }
    }

    @PreDestroy
    public void destroy() {
        if (monngoClient != null) {
            monngoClient.close();
        }
    }

    public DB getDb() {
        return db;
    }
}
