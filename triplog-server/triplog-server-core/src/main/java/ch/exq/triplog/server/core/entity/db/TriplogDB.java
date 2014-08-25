package ch.exq.triplog.server.core.entity.db;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.MongoClient;
import org.slf4j.Logger;

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
public class TriplogDB {

    @Inject
    Logger logger;

    @Inject
    @Config(key = "triplog.mongodb.host", description = "The MongoDB server hostname", fallback = "localhost")
    SystemProperty host;

    @Inject
    @Config(key = "triplog.mongodb.port", description = "The MongoDB server port", fallback = "27017")
    SystemProperty port;

    @Inject
    @Config(key = "triplog.mongodb.dbname", description = "The database name where TripLog stores its data", fallback = "triplog")
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

    public DBCollection getTripCollection() {
        return db.getCollection(TripDBObject.COLLECTION_NAME);
    }

    public DBCollection getStepCollection() {
        return db.getCollection(StepDBObject.COLLECTION_NAME);
    }
}
