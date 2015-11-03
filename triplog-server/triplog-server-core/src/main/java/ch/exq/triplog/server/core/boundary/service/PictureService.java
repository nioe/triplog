package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.boundary.service.upload.FileAttachment;
import ch.exq.triplog.server.core.control.controller.PictureController;
import ch.exq.triplog.server.core.control.controller.ResourceController;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import javax.activation.MimetypesFileTypeMap;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.net.URI;

@Path("/trips/{tripId : [0-9a-z-]*}/steps/{stepId : [0-9a-z-]*}/pictures")
public class PictureService {

    @Inject
    PictureController pictureController;

    @Inject
    ResourceController resourceController;

    @GET
    @Path("{pictureName}")
    @Produces("image/*")
    public Response getImage(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) {
        File picture = pictureController.getPicture(tripId, stepId, pictureName);

        if (picture == null) {
            throw new WebApplicationException(404);
        }

        String mimeType = new MimetypesFileTypeMap().getContentType(picture);
        return Response.ok(picture, mimeType).build();
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @MultipartForm FileAttachment attachment) {
        if (pictureController.savePicture(tripId, stepId, attachment.getName(), attachment.getContent())) {
            // TODO Replace with created 201
            return Response.created(URI.create(resourceController.getPictureUrl(tripId, stepId, attachment.getName()))).build();
        } else {
            return Response.serverError().build();
        }
    }
}
