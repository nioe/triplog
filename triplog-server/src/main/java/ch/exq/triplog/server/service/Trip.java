package ch.exq.triplog.server.service;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 27.03.2014.
 */
@Path("/")
public class Trip {
    @Context
    private UriInfo context;

    @GET
    @Path("/trip/{tripId : [0-9]*}")
    public Response getTrip(@PathParam("tripId") String tripId) {
        String json = "{ tripId : " + tripId + " }";
        return Response.ok(json, MediaType.APPLICATION_JSON).build();
    }
}
