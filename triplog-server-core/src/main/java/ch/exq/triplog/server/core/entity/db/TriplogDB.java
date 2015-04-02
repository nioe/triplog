package ch.exq.triplog.server.core.entity.db;

import ch.exq.triplog.server.util.config.Config;
import ch.exq.triplog.server.util.config.SystemProperty;
import com.mongodb.*;
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
    @Config(key = "triplog.mongodb.user", description = "The MongoDB user")
    SystemProperty user;

    @Inject
    @Config(key = "triplog.mongodb.password", description = "The MongoDB password")
    SystemProperty password;

    @Inject
    @Config(key = "triplog.mongodb.dbname", description = "The database name where TripLog stores its data", fallback = "triplog")
    SystemProperty dbName;

    private MongoClient mongoClient;
    private DB db;

    @PostConstruct
    public void init() {
        try {
            mongoClient = new MongoClient(new ServerAddress(host.getString(), port.getInteger()));
            mongoClient.setWriteConcern(WriteConcern.SAFE);

            db = mongoClient.getDB(dbName.getString());

            if (!db.authenticate(user.getString(), password.getString().toCharArray())) {
                throw new RuntimeException("Not able to authenticate with MongoDB");
            }
        } catch (UnknownHostException e) {
            logger.error("DB Connection could not be established!", e);
        }
    }

    @PreDestroy
    public void destroy() {
        if (mongoClient != null) {
            mongoClient.close();
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
