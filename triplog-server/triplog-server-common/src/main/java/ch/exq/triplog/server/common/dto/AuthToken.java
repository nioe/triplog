package ch.exq.triplog.server.common.dto;

import ch.exq.triplog.server.util.misc.UUIDUtil;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.time.LocalDateTime;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:21
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class AuthToken {

    @XmlElement
    private final String id;

    @XmlElement
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
