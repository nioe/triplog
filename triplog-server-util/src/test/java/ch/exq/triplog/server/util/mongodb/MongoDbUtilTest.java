package ch.exq.triplog.server.util.mongodb;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class MongoDbUtilTest {

    @Test
    public void testIsValidObjectId_oneValid() {
        assertTrue(MongoDbUtil.isValidObjectId("abcdef123456789012345678"));
    }

    @Test
    public void testIsValidObjectId_twoValid() {
        assertTrue(MongoDbUtil.isValidObjectId("abcdef123456789012345678", "1234567890abcdef12345678"));
    }

    @Test
    public void testIsValidObjectId_oneInvalid() {
        assertFalse(MongoDbUtil.isValidObjectId("abcdef12345678901234567"));
    }

    @Test
    public void testIsValidObjectId_oneValidOneInvalid() {
        assertFalse(MongoDbUtil.isValidObjectId("abcdef123456789012345678", "1234567890abcdef1234567"));
    }
}