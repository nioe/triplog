package ch.exq.triplog.server.core.control.controller.filter;

import ch.exq.triplog.server.common.dto.dataprovider.MetaDataProvider;

import static java.time.LocalDateTime.now;

public class PublishedChecker {

    public static boolean shouldBeShown(MetaDataProvider metaDataProvider, boolean isAuthenticatedUser) {
        return isAuthenticatedUser || (metaDataProvider != null && metaDataProvider.getPublished() != null && !metaDataProvider.getPublished().isAfter(now()));
    }
}
