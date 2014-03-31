package ch.exq.triplog.server.service;

import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.dao.TripDAO;
import ch.exq.triplog.server.service.security.AuthenticationRequired;

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
    private TripDAO tripDAO;

    @GET
    @Path("/trip/{tripId : [0-9]*}")
    public Response getTrip(@PathParam("tripId") int tripId) {
        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(trip, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/trips")
    public Response getAllTrips() {
        return Response.ok(tripDAO.getAllTrips(), MediaType.APPLICATION_JSON).build();
    }

    @POST
    @Path("/trip")
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createTrip(Trip trip) {
        return Response.ok(tripDAO.createTrip(trip), MediaType.APPLICATION_JSON).build();
    }
}
