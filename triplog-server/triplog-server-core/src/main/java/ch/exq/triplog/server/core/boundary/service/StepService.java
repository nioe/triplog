package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.core.boundary.security.AuthTokenHandler;
import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.control.controller.StepController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("/trips/{tripId : [0-9a-z-]*}/steps")
public class StepService {

    private StepController stepController;
    private ResponseController responseController;
    private AuthTokenHandler authTokenHandler;

    private static final String X_AUTH_TOKEN = "X-AUTH-TOKEN";

    public StepService() {}

    @Inject
    public StepService(StepController stepController, ResponseController responseController, AuthTokenHandler authTokenHandler) {
        this.stepController = stepController;
        this.responseController = responseController;
        this.authTokenHandler = authTokenHandler;
    }

    @GET
    @Path("{stepId : [0-9a-z-]*}")
    @Produces(APPLICATION_JSON)
    public Response getStep(@PathParam("tripId") String tripId, @PathParam("stepId") String stepId, @HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        StepDetail stepDetail = stepController.getStep(tripId, stepId, authTokenHandler.isValidToken(xAuthToken, true));

        if (stepDetail == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(stepDetail).build();
    }

    @GET
    @Produces(APPLICATION_JSON)
    public Response getAllStepsOfTrip(@PathParam("tripId") String tripId, @HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        return Response.ok(stepController.getAllStepsOfTrip(tripId, authTokenHandler.isValidToken(xAuthToken, true))).build();
    }

    @POST
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
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
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
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
