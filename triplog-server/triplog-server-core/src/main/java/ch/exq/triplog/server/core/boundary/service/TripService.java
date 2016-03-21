package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.boundary.security.AuthTokenHandler;
import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.control.controller.ResponseController;
import ch.exq.triplog.server.core.control.controller.TripController;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.util.List;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("/trips")
public class TripService {

    private TripController tripController;
    private ResponseController responseController;
    private AuthTokenHandler authTokenHandler;

    private static final String X_AUTH_TOKEN = "X-AUTH-TOKEN";

    public TripService() {}

    @Inject
    public TripService(TripController tripController, ResponseController responseController, AuthTokenHandler authTokenHandler) {
        this.tripController = tripController;
        this.responseController = responseController;
        this.authTokenHandler = authTokenHandler;
    }

    @GET
    @Path("{tripId : [0-9a-z-]*}")
    @Produces(APPLICATION_JSON)
    public Response getTrip(@PathParam("tripId") String tripId, @HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        Trip trip = tripController.getTripById(tripId, authTokenHandler.isValidToken(xAuthToken, true));
        if (trip == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(trip).build();
    }

    @GET
    @Path("{tripId : [0-9a-z-]*}/gpsPoints")
    @Produces(APPLICATION_JSON)
    public Response getAllGpsPointsOfTrip(@PathParam("tripId") String tripId, @HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        List<GpsPoint> gpsPoints = tripController.getAllGpsPointsOfTrip(tripId, authTokenHandler.isValidToken(xAuthToken, true));
        if (gpsPoints == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(gpsPoints).build();
    }

    @GET
    @Produces(APPLICATION_JSON)
    public Response getAllTrips(@HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        return Response.ok(tripController.getAllTrips(authTokenHandler.isValidToken(xAuthToken, true))).build();
    }

    @POST
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @AuthenticationRequired
    public Response createTrip(Trip trip) {
        try {
            return Response.ok(tripController.createTrip(trip)).build();
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @PUT
    @Path("{tripId : [0-9a-z-]*}")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @AuthenticationRequired
    public Response updateTrip(@PathParam("tripId") String tripId, Trip trip) {
        try {
            Trip updatedTrip = tripController.updateTrip(tripId, trip);
            if (updatedTrip == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            return Response.ok(updatedTrip).build();
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @DELETE
    @Path("{tripId : [0-9a-z-]*}")
    @AuthenticationRequired
    public Response deleteTrip(@PathParam("tripId") String tripId) {
        boolean deleted = tripController.deleteTripWithId(tripId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }
}
