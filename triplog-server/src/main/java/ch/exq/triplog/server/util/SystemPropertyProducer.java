package ch.exq.triplog.server.util;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.spi.InjectionPoint;
import javax.enterprise.inject.Produces;
import java.io.Serializable;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 04.04.14
 * Time: 09:04
 */
@ApplicationScoped
public class SystemPropertyProducer implements Serializable {

    @Produces
    @Config(key = "")
    SystemProperty getParamValue(InjectionPoint injectionPoint) {
        final Config config = injectionPoint.getAnnotated().getAnnotation(Config.class);
        return new SystemProperty(config);
    }
}
