package ch.exq.triplog.server.control.controller;

import ch.exq.triplog.server.util.config.Hardcoded;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class ResourceControllerTest {

    private static final String PROTOCOL = "http";
    private static final String HOST = "host";
    private static final String PORT = "80";

    private ResourceController resourceController;

    @Before
    public void setUp() {
        this.resourceController = new ResourceController();
        this.resourceController.protocol = Hardcoded.configuration(PROTOCOL);
        this.resourceController.hostName = Hardcoded.configuration(HOST);
        this.resourceController.port = Hardcoded.configuration(PORT);
    }

    @Test
    public void testGetLegUrl() throws Exception {
        String legUrl = resourceController.getLegUrl("123","456");
        assertEquals(PROTOCOL + "://" + HOST + ":" + PORT + "/trip/123/leg/456", legUrl);
    }

    @Test
    public void testGetImageUrl() throws Exception {
        String imageUrl = resourceController.getImageUrl("foo.jpg");
        assertEquals(PROTOCOL + "://" + HOST + ":" + PORT + "/image/foo.jpg", imageUrl);
    }

    @Test
    public void testGetServerRoot() throws Exception {
        String serverRoot = resourceController.getServerRoot();
        assertEquals(PROTOCOL + "://" + HOST + ":" + PORT, serverRoot);
    }

    @Test
    public void testGetLoginUrl() throws Exception {
        String loginUrl = resourceController.getLoginUrl();
        assertEquals(PROTOCOL + "://" + HOST + ":" + PORT + "/login", loginUrl);
    }
}