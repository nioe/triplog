package ch.exq.triplog.server.core.boundary.service.ogp;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

import java.io.IOException;
import java.net.URL;

public class OgpIndex {
    private static final String OGP_INDEX_HTML = "ogpIndex.html";
    private static final String TITLE_PLACEHOLDER = "{{ title }}";
    private static final String DESCRIPTION_PLACEHOLDER = "{{ description }}";
    private static final String IMAGE_PLACEHOLDER = "{{ image }}";
    private static final String URL_PLACEHOLDER = "{{ url }}";

    private final String url;
    private final String title;
    private final String description;
    private final String image;

    public OgpIndex(String url, String title, String description, String image) {
        this.url = url;
        this.title = title;
        this.description = description;
        this.image = image;
    }

    @Override
    public String toString() {
        try {
            return loadOgpIndexFile()
                    .replace(URL_PLACEHOLDER, url)
                    .replace(TITLE_PLACEHOLDER, title)
                    .replace(DESCRIPTION_PLACEHOLDER, description)
                    .replace(IMAGE_PLACEHOLDER, image);
        } catch (IOException e) {
            return "Could not generate index.html with OGP meta tags...";
        }
    }

    private String loadOgpIndexFile() throws IOException {
        URL url = Resources.getResource(OGP_INDEX_HTML);
        return Resources.toString(url, Charsets.UTF_8);
    }
}