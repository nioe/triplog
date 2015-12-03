package ch.exq.triplog.server.core.control.controller.filter;

import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.entity.db.TripDBObject;

import static java.time.LocalDateTime.now;

public class PublishedChecker {

    public static boolean shouldBeShown(TripDBObject tripDBObject, boolean isAuthenticatedUser) {
        return isAuthenticatedUser || (tripDBObject != null && tripDBObject.getPublished() != null && !tripDBObject.getPublished().isAfter(now()));
    }

    public static boolean shouldBeShown(Trip trip, boolean isAuthenticatedUser) {
        return isAuthenticatedUser || (trip != null && trip.getPublished() != null && !trip.getPublished().isAfter(now()));
    }

    public static boolean shouldBeShown(StepDBObject stepDBObject, boolean isAuthenticatedUser) {
        return isAuthenticatedUser || (stepDBObject != null && stepDBObject.getPublished() != null && !stepDBObject.getPublished().isAfter(now()));
    }

    public static boolean shouldBeShown(Step step, boolean isAuthenticatedUser) {
        return isAuthenticatedUser || (step != null && step.getPublished() != null && !step.getPublished().isAfter(now()));
    }
}
