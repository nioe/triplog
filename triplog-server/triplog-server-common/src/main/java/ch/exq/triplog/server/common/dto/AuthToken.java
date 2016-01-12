package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.misc.UUIDUtil;

import java.time.LocalDateTime;

public class AuthToken {

    private final String id;
    private LocalDateTime expiryDate;

    public AuthToken(LocalDateTime expiryDate) {
        this.id = UUIDUtil.getRandomUUID();
        this.expiryDate = expiryDate;
    }

    public String getId() {
        return id;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
}
