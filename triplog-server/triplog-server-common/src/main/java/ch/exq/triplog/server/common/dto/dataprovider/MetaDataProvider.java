package ch.exq.triplog.server.common.dto.dataprovider;

import java.time.LocalDateTime;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 03.12.15
 * Time: 17:13
 */
public interface MetaDataProvider {

    LocalDateTime getCreated();

    LocalDateTime getLastUpdated();

    LocalDateTime getPublished();
}
