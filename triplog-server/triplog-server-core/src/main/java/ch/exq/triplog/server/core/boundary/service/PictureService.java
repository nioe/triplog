package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.boundary.service.upload.FileAttachment;
import ch.exq.triplog.server.core.control.controller.PictureController;
import ch.exq.triplog.server.core.control.controller.ResourceController;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import javax.activation.MimetypesFileTypeMap;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.net.URI;

import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

@Path("/trips/{tripId : [0-9a-z-]*}/steps/{stepId : [0-9a-z-]*}/pictures")
public class PictureService {

    private PictureController pictureController;
    private ResourceController resourceController;
    private ResponseController responseController;

    public PictureService() {}

    @Inject
    public PictureService(PictureController pictureController, ResourceController resourceController, ResponseController responseController) {
        this.pictureController = pictureController;
        this.resourceController = resourceController;
        this.responseController = responseController;
    }

    @GET
    @Path("{pictureName}")
    @Produces("image/*")
    public Response getPicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) throws IOException {
        File picture = pictureController.getPicture(tripId, stepId, pictureName);

        if (picture == null) {
            return Response.status(NOT_FOUND).build();
        }

        return createPictureResponse(picture);
    }

    @GET
    @Path("{pictureName}/thumbnail")
    @Produces("image/*")
    public Response getPictureThumbnail(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) throws IOException {
        File picture = pictureController.getPictureThumbnail(tripId, stepId, pictureName);

        if (picture == null) {
            return Response.status(NOT_FOUND).build();
        }

        return createPictureResponse(picture);
    }


    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @AuthenticationRequired
    public Response uploadPicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @MultipartForm FileAttachment attachment) {
        if (attachment.getContent() == null) {
            return Response.status(BAD_REQUEST).entity("File must not be empty.").build();
        }

        if (attachment.getName() == null) {
            return Response.status(BAD_REQUEST).entity("Filename must not be null.").build();
        }

        try {
            String pictureName = pictureController.savePicture(tripId, stepId, attachment.getName(), attachment.getContent());
            return Response.created(URI.create(resourceController.getPictureUrl(tripId, stepId, pictureName))).build();
        } catch (IllegalArgumentException ex) {
            return Response.status(NOT_FOUND).entity(ex.getMessage()).build();
        } catch (IOException ex) {
            throw new WebApplicationException("Picture could not be saved.", ex, 500);
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @DELETE
    @Path("{pictureName}")
    @AuthenticationRequired
    public Response deletePicture(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @PathParam("pictureName") String pictureName) {
        try {
            pictureController.deletePicture(tripId, stepId, pictureName);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            return Response.status(NOT_FOUND).entity(ex.getMessage()).build();
        } catch (IOException ex) {
            throw new WebApplicationException("Picture could not be deleted.", ex, 500);
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    private Response createPictureResponse(File picture) {
        String mimeType = new MimetypesFileTypeMap().getContentType(picture);

        final CacheControl cacheControl = new CacheControl();
        cacheControl.setMaxAge(31536000); // 1 year

        return Response.ok(picture, mimeType).cacheControl(cacheControl).build();
    }
}
