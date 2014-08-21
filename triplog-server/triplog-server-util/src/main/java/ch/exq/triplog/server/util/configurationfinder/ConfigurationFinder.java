package ch.exq.triplog.server.util.configurationfinder;

import ch.exq.triplog.server.core.util.config.Config;
import org.reflections.Reflections;
import org.reflections.scanners.FieldAnnotationsScanner;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 21.08.14
 * Time: 13:02
 */
public class ConfigurationFinder {

    public static final String TRIPLOG_SERVER_PACKAGE = "ch.exq.triplog.server.core";

    public static void main(String[] args) {
        Reflections reflections = new Reflections(TRIPLOG_SERVER_PACKAGE, new FieldAnnotationsScanner());
        printConfigAsMarkdown(reflections.getFieldsAnnotatedWith(Config.class));
    }

    private static void printConfigAsMarkdown(Set<Field> fields) {
        Set<Config> configs = fields.stream().map(field -> getConfigOf(field)).collect(Collectors.toSet());

        System.out.println(new ConfigMarkdown(configs));
    }

    private static Config getConfigOf(Field field) {
        for (Annotation a : field.getAnnotations()) {
            if (a instanceof Config) {
                return (Config) a;
            }
        }

        throw new IllegalArgumentException("No Config Annotation present for field " + field);
    }
}
