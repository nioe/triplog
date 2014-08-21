package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.control.controller.StepController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.dto.Step;
import ch.exq.triplog.server.core.control.controller.ResponseController;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
@Path("/")
public class StepService {

    @Inject
    StepController stepController;

    @Inject
    ResponseController responseController;

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/step/{stepId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId) {
        Step step = stepController.getStep(tripId, stepId);

        if (step == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(step).build();
    }

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/steps")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllStepsOfTrip(@PathParam("tripId") String tripId) {
        return Response.ok(stepController.getAllStepsOfTrip(tripId)).build();
    }

    @POST
    @Path("/trip/{tripId : [0-9a-f]*}/step")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createStep(@PathParam("tripId") String tripId, Step step) {
        step.setTripId(tripId);

        try {
            return Response.ok(stepController.createStep(step)).build();
        } catch (DisplayableException ex) {
            return responseController.badRequest(ex);
        }
    }

    @POST
    @Path("/trip/{tripId : [0-9a-f]*}/step/{stepId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response updateStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, Step step) {
        try {
            Step updatedStep = stepController.updateStep(tripId, stepId, step);
            if (updatedStep == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            return Response.ok(updatedStep).build();
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @DELETE
    @Path("/trip/{tripId : [0-9a-f]*}/step/{stepId : [0-9a-f]*}")
    @AuthenticationRequired
    public Response deleteStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId) {
        boolean deleted = stepController.deleteStep(tripId, stepId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }
}
