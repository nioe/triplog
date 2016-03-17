package ch.exq.triplog.server.core.control.controller;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ResourceControllerTest {

    private ResourceController resourceController = new ResourceController();

    @Test
    public void should_return_relative_picture_url() throws Exception {
        // when
        String actual = resourceController.getPictureUrl("testTrip", "testStep", "foo.jpg");

        // then
        assertThat(actual).isEqualTo("trips/testTrip/steps/testStep/pictures/foo.jpg");
    }

    @Test
    public void should_return_relative_picture_thumbnail_url() throws Exception {
        // when
        String actual = resourceController.getPictureThumbnailUrl("testTrip", "testStep", "foo.jpg");

        // then
        assertThat(actual).isEqualTo("trips/testTrip/steps/testStep/pictures/foo.jpg/thumbnail");
    }

    @Test
    public void should_return_relative_login_url() throws Exception {
        // when
        String actual = resourceController.getLoginUrl();

        // then
        assertThat(actual).isEqualTo("login");
    }
}