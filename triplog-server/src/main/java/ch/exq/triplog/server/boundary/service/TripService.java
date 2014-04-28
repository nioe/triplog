package ch.exq.triplog.server.boundary.service;

import ch.exq.triplog.server.control.controller.TripController;
import ch.exq.triplog.server.dto.Trip;
import ch.exq.triplog.server.control.exceptions.CreationException;
import ch.exq.triplog.server.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.util.http.ResponseHelper;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@Path("/")
public class TripService {
    @Inject
    private TripController tripController;

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTrip(@PathParam("tripId") String tripId) {
        Trip trip = tripController.getTripById(tripId);

        if (trip == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(trip).build();
    }

    @GET
    @Path("/trips")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllTrips() {
        return Response.ok(tripController.getAllTrips()).build();
    }

    @POST
    @Path("/trip")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createTrip(Trip trip) {
        try {
            return Response.ok(tripController.createTrip(trip)).build();
        } catch (CreationException ex) {
            return ResponseHelper.badRequest(ex);
        }
    }

    @DELETE
    @Path("/trip/{tripId : [0-9a-f]*}")
    @AuthenticationRequired
    public Response deleteTrip(@PathParam("tripId") String tripId) {
        boolean deleted = tripController.deleteTripWithId(tripId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }
}
