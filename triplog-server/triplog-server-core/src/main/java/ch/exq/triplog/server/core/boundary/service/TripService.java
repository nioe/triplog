package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.control.controller.TripController;
import ch.exq.triplog.server.core.dto.Trip;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.core.control.controller.ResponseController;

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
    TripController tripController;

    @Inject
    ResponseController responseController;

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
        } catch (DisplayableException e) {
            return responseController.badRequest(e);
        }
    }

    @POST
    @Path("/trip/{tripId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
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
