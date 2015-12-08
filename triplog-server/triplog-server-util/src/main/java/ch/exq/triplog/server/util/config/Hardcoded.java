package ch.exq.triplog.server.util.config;

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
}