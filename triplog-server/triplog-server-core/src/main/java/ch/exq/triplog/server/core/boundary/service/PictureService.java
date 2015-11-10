package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.boundary.service.upload.FileAttachment;
import ch.exq.triplog.server.core.control.controller.PictureController;
import ch.exq.triplog.server.core.control.controller.ResourceController;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import javax.activation.MimetypesFileTypeMap;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.net.URI;

@Path("/trips/{tripId : [0-9a-z-]*}/steps/{stepId : [0-9a-z-]*}/pictures")
public class PictureService {

    @Inject
    PictureController pictureController;

    @Inject
    ResourceController resourceController;

    @Inject
    ResponseController responseController;

    @GET
    @Path("{pictureName}")
    @Produces("image/*")
    public Response getPicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) {
        File picture = pictureController.getPicture(tripId, stepId, pictureName);

        if (picture == null) {
            throw new WebApplicationException("Picture could not be found.", 404);
        }

        String mimeType = new MimetypesFileTypeMap().getContentType(picture);
        return Response.ok(picture, mimeType).build();
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadPicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @MultipartForm FileAttachment attachment) {
        if (attachment.getContent() == null) {
            throw new WebApplicationException("File must not be empty.", 400);
        }

        try {
            String pictureName = pictureController.savePicture(tripId, stepId, attachment.getName(), attachment.getContent());
            return Response.created(URI.create(resourceController.getPictureUrl(tripId, stepId, pictureName))).build();
        } catch (IllegalArgumentException ex) {
            throw new WebApplicationException(ex.getMessage(), ex, 404);
        } catch (IOException ex) {
            throw new WebApplicationException("Picture could not be saved.", ex, 500);
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @DELETE
    @Path("{pictureName}")
    public Response deletePicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) {
        try {
            pictureController.delete(tripId, stepId, pictureName);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw new WebApplicationException(ex.getMessage(), ex, 404);
        } catch (IOException ex) {
            throw new WebApplicationException("Picture could not be deleted.", ex, 500);
        }
    }
}
