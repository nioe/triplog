package ch.exq.triplog.server.core.control.controller.filter;

import ch.exq.triplog.server.core.entity.db.TripDBObject;
import org.junit.Test;

import static java.time.LocalDateTime.now;
import static org.assertj.core.api.Assertions.assertThat;

public class PublishedCheckerTest {

    @Test
     public void should_return_false_if_user_is_not_authenticated_and_tripDbObject_is_null() throws Exception {
        // given
        boolean isAuthenticatedUser = false;
        TripDBObject tripDBObject = null;

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isFalse();
    }

    @Test
    public void should_return_true_if_user_is_authenticated_and_tripDbObject_is_null() throws Exception {
        // given
        boolean isAuthenticatedUser = true;
        TripDBObject tripDBObject = null;

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isTrue();
    }

    @Test
     public void should_return_false_if_user_is_not_authenticated_and_publish_date_is_null() throws Exception {
        // given
        boolean isAuthenticatedUser = false;
        TripDBObject tripDBObject = new TripDBObject();

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isFalse();
    }

    @Test
    public void should_return_false_if_user_is_not_authenticated_and_publish_date_after_today() throws Exception {
        // given
        boolean isAuthenticatedUser = false;
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setPublished(now().plusDays(2));

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isFalse();
    }

    @Test
    public void should_return_true_if_user_is_not_authenticated_and_publish_date_equal_to_today() throws Exception {
        // given
        boolean isAuthenticatedUser = false;
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setPublished(now());

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isTrue();
    }

    @Test
    public void should_return_true_if_user_is_not_authenticated_and_publish_date_before_today() throws Exception {
        // given
        boolean isAuthenticatedUser = false;
        TripDBObject tripDBObject = new TripDBObject();
        tripDBObject.setPublished(now().minusDays(2));

        // when
        boolean actual = PublishedChecker.shouldBeShown(tripDBObject, isAuthenticatedUser);

        // then
        assertThat(actual).isTrue();
    }
}