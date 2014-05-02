package ch.exq.triplog.server.entity.db;

import com.mongodb.BasicDBObject;
import org.slf4j.Logger;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 28.04.14
 * Time: 13:41
 */
public abstract class AbstractDBObject<T> extends BasicDBObject {

    protected abstract Logger logger();

    public void updateFrom(T other) throws InvocationTargetException, IllegalAccessException {
        if (other == null) {
            return;
        }

        for (Method method : other.getClass().getDeclaredMethods()) {
            if (method.getName().startsWith("get")) {
                Object value = method.invoke(other);
                if (value == null) {
                    continue;
                }

                if (Collection.class.isAssignableFrom(method.getReturnType()) && ((Collection)value).size() == 0) {
                    continue;
                }


                String setterName = method.getName().replace("get", "set");
                try {
                    this.getClass().getMethod(setterName, method.getReturnType()).invoke(this, value);
                } catch (NoSuchMethodException e) {
                    logger().warn("Could not find method {} on object {}", setterName, this);
                }
            }
        }
    }
}
