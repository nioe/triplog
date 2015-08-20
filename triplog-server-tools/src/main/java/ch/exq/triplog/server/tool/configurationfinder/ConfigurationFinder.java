package ch.exq.triplog.server.tool.configurationfinder;

import ch.exq.triplog.server.util.config.Config;
import org.reflections.Reflections;
import org.reflections.scanners.FieldAnnotationsScanner;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 21.08.14
 * Time: 13:02
 */
public class ConfigurationFinder {

    public static final String TRIPLOG_SERVER_PACKAGE = "ch.exq.triplog.server.core";
    public static final String POSSIBLE_PROPERTIES_TITLE = "### Possible Properties ###";

    public static void main(String[] args) {
        Reflections reflections = new Reflections(TRIPLOG_SERVER_PACKAGE, new FieldAnnotationsScanner());
        String configAsMarkdown = getConfigAsMarkdown(reflections.getFieldsAnnotatedWith(Config.class));

        if (args.length > 0) {
            Path readmeFilePath = Paths.get(args[0]);

            if (Files.exists(readmeFilePath)) {
                writeConfigsToReadmeFile(readmeFilePath, configAsMarkdown);
                return;
            }
        }

        System.out.println(configAsMarkdown);
    }

    private static String getConfigAsMarkdown(Set<Field> fields) {
        Set<Config> configs = fields.stream().map(field -> getConfigOf(field)).collect(Collectors.toSet());

        return new ConfigMarkdown(configs).toString();
    }

    private static Config getConfigOf(Field field) {
        for (Annotation a : field.getAnnotations()) {
            if (a instanceof Config) {
                return (Config) a;
            }
        }

        throw new IllegalArgumentException("No Config Annotation present for field " + field);
    }

    private static void writeConfigsToReadmeFile(Path readmeFilePath, String configAsMarkdown) {
        try {
            String readmeFileContent = new String(Files.readAllBytes(readmeFilePath));

            StringBuilder sb = new StringBuilder(readmeFileContent.substring(0, readmeFileContent.indexOf(POSSIBLE_PROPERTIES_TITLE) + POSSIBLE_PROPERTIES_TITLE.length()));
            sb.append("\n").append(configAsMarkdown).append("\n");

            Files.write(readmeFilePath, sb.toString().getBytes());
        } catch (IOException e) {
            System.err.println("Failure while updating README File " + readmeFilePath);
            e.printStackTrace();
        }
    }
}
