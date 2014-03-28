package ch.exq.triplog.server.service;

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
    @Context
    private UriInfo context;

    @GET
    @Path("/trip/{tripId : [0-9]*}")
    public Response getTrip(@PathParam("tripId") String tripId) {
        String json = "{ tripId : " + tripId + " }";
        return Response.ok(json, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/trip/get-all")
    public Response getAllTrips() {
        return Response.ok("{ all trips }", MediaType.APPLICATION_JSON).build();
    }
}
