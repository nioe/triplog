package ch.exq.triplog.server.service;

import ch.exq.triplog.server.entity.Trip;
import ch.exq.triplog.server.entity.dao.TripDAO;
import ch.exq.triplog.server.util.JsonUtil;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@Path("/")
public class TripService {
    @Inject
    private TripDAO tripDAO;

    @Context
    private UriInfo context;

    @GET
    @Path("/trip/{tripId : [0-9]*}")
    public Response getTrip(@PathParam("tripId") int tripId) {
        Trip trip = tripDAO.getTripById(tripId);

        if (trip == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(JsonUtil.toJsonString(trip), MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/trips")
    public Response getAllTrips() {
        return Response.ok(JsonUtil.toJsonArray(tripDAO.getAllTrips()), MediaType.APPLICATION_JSON).build();
    }
}
