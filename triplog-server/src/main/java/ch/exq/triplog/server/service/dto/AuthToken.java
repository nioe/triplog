package ch.exq.triplog.server.service.dto;

import ch.exq.triplog.server.util.UUIDUtil;

import javax.xml.bind.annotation.XmlElement;
import java.util.Date;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 16.04.14
 * Time: 15:21
 */
public class AuthToken {

    @XmlElement
    private final String id;

    @XmlElement
    private final Date expiryDate;

    public AuthToken(Date expiryDate) {
        this.id = UUIDUtil.getRandomUUID();
        this.expiryDate = expiryDate;
    }

    public String getId() {
        return id;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }
}
