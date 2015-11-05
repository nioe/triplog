package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.control.controller.StepController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
@Path("/trips/{tripId : [0-9a-z-]*}/steps")
public class StepService {

    @Inject
    StepController stepController;

    @Inject
    ResponseController responseController;

    @GET
    @Path("{stepId : [0-9a-z-]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId) {
        StepDetail stepDetail = stepController.getStep(tripId, stepId);

        if (stepDetail == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(stepDetail).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllStepsOfTrip(@PathParam("tripId") String tripId) {
        return Response.ok(stepController.getAllStepsOfTrip(tripId)).build();
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createStep(@PathParam("tripId") String tripId, StepDetail stepDetail) {
        stepDetail.setTripId(tripId);

        try {
            return Response.ok(stepController.createStep(stepDetail)).build();
        } catch (DisplayableException ex) {
            return responseController.badRequest(ex);
        }
    }

    @PUT
    @Path("{stepId : [0-9a-z-]*}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response updateStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, StepDetail stepDetail) {
        try {
            StepDetail updatedStepDetail = stepController.updateStep(tripId, stepId, stepDetail);
            if (updatedStepDetail == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            return Response.ok(updatedStepDetail).build();
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @DELETE
    @Path("{stepId : [0-9a-z-]*}")
    @AuthenticationRequired
    public Response deleteStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId) {
        boolean deleted = stepController.deleteStep(tripId, stepId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }
}
