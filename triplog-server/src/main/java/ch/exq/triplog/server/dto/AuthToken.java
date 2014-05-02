package ch.exq.triplog.server.dto;

import ch.exq.triplog.server.util.misc.UUIDUtil;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;

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
    private Date expiryDate;

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

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}
