package ch.exq.triplog.server.util;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 15.04.14
 * Time: 16:25
 */
public class Hardcoded {

    public static SystemProperty configuration(final String value) {
        return new SystemProperty() {

            private static final long serialVersionUID = 1L;

            @Override
            public String getString() {
                return value;
            }
        };
    }

    public static SystemProperty configuration(boolean value) {
        return configuration(value ? "true" : "false");
    }

    public static SystemProperty configuration(int i) {
        return configuration(String.valueOf(i));
    }

    public static void enableDefaults(Object... objectsWithConfigurationProperties) {
        for (Object objectWithConfigurationProperties : objectsWithConfigurationProperties) {
            for (Field field : getDeclaredFields(objectWithConfigurationProperties)) {
                Config config = field.getAnnotation(Config.class);
                if (config != null && config.fallback() != null) {
                    try {
                        field.setAccessible(true);
                        field.set(objectWithConfigurationProperties, configuration(config.fallback()));
                    } catch (Exception e) {
                        throw new RuntimeException("Cannot set fallback value of system property field "
                                + field.getName(), e);
                    }
                }
            }
        }
    }

    private static ArrayList<Field> getDeclaredFields(Object o) {
        ArrayList<Field> declaredFields = new ArrayList<>();
        Class<?> clazz = o.getClass();

        do {
            declaredFields.addAll(Arrays.asList(clazz.getDeclaredFields()));
            clazz = clazz.getSuperclass();
        } while (clazz != null && clazz != Object.class);

        return declaredFields;
    }
}