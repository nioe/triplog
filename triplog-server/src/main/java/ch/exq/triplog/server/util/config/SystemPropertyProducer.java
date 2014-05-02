package ch.exq.triplog.server.util.config;

import javax.enterprise.context.Dependent;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.InjectionPoint;
import java.io.Serializable;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 09:04
 */
@Dependent
public class SystemPropertyProducer implements Serializable {

    @Produces
    @Config(key = "")
    SystemProperty getConfig(InjectionPoint injectionPoint) {
        final Config config = injectionPoint.getAnnotated().getAnnotation(Config.class);
        return new SystemProperty(config);
    }
}
