package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.util.config.Hardcoded;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ResourceControllerTest {

    private ResourceController resourceController = new ResourceController();

    @Test
    public void should_return_absolute_picture_url() throws Exception {
        // given
        this.resourceController.protocol = Hardcoded.configuration("http");
        this.resourceController.hostName = Hardcoded.configuration("localhost");
        this.resourceController.port = Hardcoded.configuration("8080");
        this.resourceController.relative = Hardcoded.configuration(false);

        // when
        String actual = resourceController.getPictureUrl("testTrip", "testStep", "foo.jpg");

        // then
        assertThat(actual).isEqualTo("http://localhost:8080/trips/testTrip/steps/testStep/pictures/foo.jpg");
    }

    @Test
    public void should_return_relative_picture_url() throws Exception {
        // given
        this.resourceController.hostName = Hardcoded.configuration("services");
        this.resourceController.relative = Hardcoded.configuration(true);

        // when
        String actual = resourceController.getPictureUrl("testTrip", "testStep", "foo.jpg");

        // then
        assertThat(actual).isEqualTo("/trips/testTrip/steps/testStep/pictures/foo.jpg");
    }

    @Test
    public void should_return_absolute_server_root() throws Exception {
        // given
        this.resourceController.protocol = Hardcoded.configuration("http");
        this.resourceController.hostName = Hardcoded.configuration("localhost");
        this.resourceController.port = Hardcoded.configuration("8080");
        this.resourceController.relative = Hardcoded.configuration(false);

        // when
        String actual = resourceController.getServerRoot();

        // then
        assertThat(actual).isEqualTo("http://localhost:8080");
    }

    @Test
    public void should_return_relative_server_root() throws Exception {
        // given
        this.resourceController.hostName = Hardcoded.configuration("services");
        this.resourceController.relative = Hardcoded.configuration(true);

        // when
        String actual = resourceController.getServerRoot();

        // then
        assertThat(actual).isEqualTo("");
    }

    @Test
    public void should_return_absolute_login_url() throws Exception {
        // given
        this.resourceController.protocol = Hardcoded.configuration("http");
        this.resourceController.hostName = Hardcoded.configuration("localhost");
        this.resourceController.port = Hardcoded.configuration("8080");
        this.resourceController.relative = Hardcoded.configuration(false);

        // when
        String actual = resourceController.getLoginUrl();

        // then
        assertThat(actual).isEqualTo("http://localhost:8080/login");
    }

    @Test
    public void should_return_relative_login_url() throws Exception {
        // given
        this.resourceController.hostName = Hardcoded.configuration("services");
        this.resourceController.relative = Hardcoded.configuration(true);

        // when
        String actual = resourceController.getLoginUrl();

        // then
        assertThat(actual).isEqualTo("/login");
    }
}