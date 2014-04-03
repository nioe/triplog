package ch.exq.triplog.server.service;

import ch.exq.triplog.server.entity.dao.LegDAO;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
@Path("/")
public class LegService {

    @Inject
    LegDAO legDAO;

    @GET
    @Path("/trip/{tripId : [0-9a-f\\-]*}/legs")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllLegsOfTrip(@PathParam("tripId") String tripId) {
        return Response.ok(legDAO.getAllLegsOfTrip(tripId)).build();
    }
}
