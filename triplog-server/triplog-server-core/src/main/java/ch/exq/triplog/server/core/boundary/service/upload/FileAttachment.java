package ch.exq.triplog.server.core.boundary.service.upload;

import javax.ws.rs.FormParam;

public class FileAttachment {
    @FormParam("file")
    private final byte[] content;

    @FormParam("filename")
    private final String name;

    public FileAttachment() {
        this(null, null); // For REST-Easy
    }

    public FileAttachment(byte[] content, String name) {
        this.content = content;
        this.name = name;
    }

    public byte[] getContent() {
        return content;
    }

    public String getName() {
        return name;
    }
}
